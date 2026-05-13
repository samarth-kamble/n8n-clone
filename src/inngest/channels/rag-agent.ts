import { channel, topic } from "@inngest/realtime";

export const RAG_AGENT_CHANNEL_NAME = "rag-agent-execution";

export const ragAgentChannel = channel(RAG_AGENT_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
