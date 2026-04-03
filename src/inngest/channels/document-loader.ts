import { channel, topic } from "@inngest/realtime";

export const DOCUMENT_LOADER_CHANNEL_NAME = "document-loader-execution";

export const documentLoaderChannel = channel(
  DOCUMENT_LOADER_CHANNEL_NAME
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
