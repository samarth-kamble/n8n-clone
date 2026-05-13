import { channel, topic } from "@inngest/realtime";

export const CHAT_MEMORY_CHANNEL_NAME = "chat-memory-execution";

export const chatMemoryChannel = channel(CHAT_MEMORY_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
