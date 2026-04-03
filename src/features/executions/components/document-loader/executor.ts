import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/lib/types";
import { documentLoaderChannel } from "@/inngest/channels/document-loader";
import prisma from "@/lib/db";

type DocumentLoaderData = {
  variableName?: string;
  documentId?: string;
};

export const documentLoaderExecutor: NodeExecutor<DocumentLoaderData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    documentLoaderChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      documentLoaderChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Document Loader: Variable name is missing");
  }

  if (!data.documentId) {
    await publish(
      documentLoaderChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Document Loader: No document selected");
  }

  const document = await step.run("get-document", () => {
    return prisma.document.findUnique({
      where: {
        id: data.documentId,
        userId,
      },
    });
  });

  if (!document) {
    await publish(
      documentLoaderChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Document Loader: Document not found");
  }

  await publish(
    documentLoaderChannel().status({
      nodeId,
      status: "success",
    })
  );

  return {
    ...context,
    [data.variableName]: {
      text: document.content,
      name: document.name,
      mimeType: document.mimeType,
    },
  };
};
