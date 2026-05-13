"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { chatMemoryChannel } from "@/inngest/channels/chat-memory";
import { inngest } from "@/inngest/client";

export type ChatMemoryToken = Realtime.Token<
  typeof chatMemoryChannel,
  ["status"]
>;

export async function fetchChatMemoryRealtimeToken(): Promise<ChatMemoryToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: chatMemoryChannel(),
    topics: ["status"],
  });

  return token;
}
