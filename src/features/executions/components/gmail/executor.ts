import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/lib/types";
import { gmailChannel } from "@/inngest/channels/gmail";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import nodemailer from "nodemailer";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type GmailData = {
  variableName?: string;
  credentialId?: string;
  senderEmail?: string;
  to?: string;
  subject?: string;
  content?: string;
};

export const gmailExecutor: NodeExecutor<GmailData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    gmailChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gmail node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gmail node: Credential is required");
  }

  if (!data.senderEmail || !data.to || !data.subject || !data.content) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gmail node: Missing email fields (senderEmail, to, subject, content)");
  }

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gmail node: Credential not found");
  }

  const appPassword = decrypt(credential.value);

  const rawTo = Handlebars.compile(data.to)(context);
  const to = decode(rawTo);

  const rawSubject = Handlebars.compile(data.subject)(context);
  const subject = decode(rawSubject);

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("gmail-send", async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: data.senderEmail,
          pass: appPassword,
        },
      });

      const info = await transporter.sendMail({
        from: data.senderEmail,
        to,
        subject,
        text: content,
      });

      return {
        ...context,
        [data.variableName!]: {
          messageId: info.messageId,
          response: info.response,
        },
      };
    });

    await publish(
      gmailChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
     await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
