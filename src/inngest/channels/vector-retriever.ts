import { channel, topic } from "@inngest/realtime";

export const VECTOR_RETRIEVER_CHANNEL_NAME = "vector-retriever-execution";

export const vectorRetrieverChannel = channel(
  VECTOR_RETRIEVER_CHANNEL_NAME
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
