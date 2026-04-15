import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/lib/types";
import { telegramChannel } from "@/inngest/channels/telegram";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

type TelegramData = {
  variableName?: string;
  botToken?: string;
  chatId?: string;
  message?: string;
};

export const telegramExecutor: NodeExecutor<TelegramData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    telegramChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.botToken || !data.chatId || !data.message) {
    await publish(
      telegramChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      "Telegram node: Bot Token, Chat ID, and Message are required"
    );
  }

  const rawMessage = Handlebars.compile(data.message)(context);
  const message = decode(rawMessage);
  
  // Support dynamic chat ID from context variables
  const chatId = Handlebars.compile(data.chatId || "")(context).trim();

  // Validate chat ID is not empty
  if (!chatId) {
    await publish(
      telegramChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      `Telegram node: Chat ID is empty. Configured value: "${data.chatId}". Make sure the variable exists in context or provide a valid chat ID.`
    );
  }

  try {
    const response = await step.run("telegram-send-message", async () => {
      try {
        const result = await ky
          .post(
            `https://api.telegram.org/bot${data.botToken}/sendMessage`,
            {
              json: {
                chat_id: chatId,
                text: message.slice(0, 4096),
                parse_mode: "HTML",
              },
            }
          )
          .json<{
            ok: boolean;
            result: { message_id: number; chat: { id: number } };
          }>();
        
        return result;
      } catch (error: any) {
        // Log the full error response from Telegram
        if (error.response) {
          const errorBody = await error.response.json();
          console.error("Telegram API Error:", errorBody);
          throw new NonRetriableError(
            `Telegram API Error: ${errorBody.description || error.message}`
          );
        }
        throw error;
      }
    });

    if (!data.variableName) {
      throw new NonRetriableError(
        "Telegram node: Variable name is missing"
      );
    }

    const result = {
      ...context,
      [data.variableName]: {
        messageId: response.result.message_id,
        chatId: chatId,
        text: message.slice(0, 4096),
      },
    };

    await publish(
      telegramChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      telegramChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
