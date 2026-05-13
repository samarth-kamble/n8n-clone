import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/lib/types";
import { chatMemoryChannel } from "@/inngest/channels/chat-memory";

type ChatMemoryData = {
  variableName?: string;
  sessionId?: string;
  messageVariable?: string;
  maxMessages?: number;
  memoryType?: "buffer" | "summary";
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// In-memory store for chat sessions (in production, use Redis or DB)
const chatSessions = new Map<string, ChatMessage[]>();

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export const chatMemoryExecutor: NodeExecutor<ChatMemoryData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    chatMemoryChannel().status({ nodeId, status: "loading" })
  );

  if (!data.variableName) {
    await publish(
      chatMemoryChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("Chat Memory: Variable name is missing");
  }

  if (!data.sessionId) {
    await publish(
      chatMemoryChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("Chat Memory: Session ID variable is missing");
  }

  let sessionId = getNestedValue(context, data.sessionId);

  // If not found in context, fallback to treating the input as a literal string
  if (!sessionId) {
    sessionId = data.sessionId;
  }

  if (typeof sessionId !== "string") {
    await publish(
      chatMemoryChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      `Chat Memory: Session ID "${data.sessionId}" must be a string`
    );
  }

  const maxMessages = data.maxMessages || 10;

  const result = await step.run("manage-chat-memory", async () => {
    // Get existing messages for this session
    let messages = chatSessions.get(sessionId) || [];

    // If a new message variable is provided, add it to history
    if (data.messageVariable) {
      const newMessage = getNestedValue(context, data.messageVariable);
      if (newMessage && typeof newMessage === "string") {
        messages.push({
          role: "user",
          content: newMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Trim to max messages
    if (messages.length > maxMessages) {
      messages = messages.slice(-maxMessages);
    }

    // Store updated messages
    chatSessions.set(sessionId, messages);

    // Format history as a string
    const history = messages
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    return {
      history,
      messages,
      messageCount: messages.length,
      sessionId,
    };
  });

  await publish(
    chatMemoryChannel().status({ nodeId, status: "success" })
  );

  return {
    ...context,
    [data.variableName!]: result,
  };
};

/**
 * Helper function to add an assistant response to chat memory.
 * Call this after the RAG agent generates a response.
 */
export function addAssistantMessage(
  sessionId: string,
  content: string
): void {
  const messages = chatSessions.get(sessionId) || [];
  messages.push({
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
  });
  chatSessions.set(sessionId, messages);
}
