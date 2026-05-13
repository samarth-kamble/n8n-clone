"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { vectorRetrieverChannel } from "@/inngest/channels/vector-retriever";
import { inngest } from "@/inngest/client";

export type VectorRetrieverToken = Realtime.Token<
  typeof vectorRetrieverChannel,
  ["status"]
>;

export async function fetchVectorRetrieverRealtimeToken(): Promise<VectorRetrieverToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: vectorRetrieverChannel(),
    topics: ["status"],
  });

  return token;
}
