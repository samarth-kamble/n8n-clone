"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { insertPineconeChannel } from "@/inngest/channels/insert-pinecone";
import { inngest } from "@/inngest/client";

export type InsertPineconeToken = Realtime.Token<
  typeof insertPineconeChannel,
  ["status"]
>;

export async function fetchInsertPineconeRealtimeToken(): Promise<InsertPineconeToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: insertPineconeChannel(),
    topics: ["status"],
  });

  return token;
}
