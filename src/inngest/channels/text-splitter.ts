import { channel, topic } from "@inngest/realtime";

export const TEXT_SPLITTER_CHANNEL_NAME = "text-splitter-execution";

export const textSplitterChannel = channel(TEXT_SPLITTER_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
