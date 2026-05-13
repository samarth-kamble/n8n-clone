import { channel, topic } from "@inngest/realtime";

export const INSERT_PINECONE_CHANNEL_NAME = "insert-pinecone-execution";

export const insertPineconeChannel = channel(
  INSERT_PINECONE_CHANNEL_NAME
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
