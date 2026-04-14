import { channel, topic } from "@inngest/realtime";

export const IF_CONDITION_CHANNEL_NAME = "if-condition-execution";

export const ifConditionChannel = channel(
  IF_CONDITION_CHANNEL_NAME
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
