"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { ragAgentChannel } from "@/inngest/channels/rag-agent";
import { inngest } from "@/inngest/client";

export type RagAgentToken = Realtime.Token<
  typeof ragAgentChannel,
  ["status"]
>;

export async function fetchRagAgentRealtimeToken(): Promise<RagAgentToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: ragAgentChannel(),
    topics: ["status"],
  });

  return token;
}
