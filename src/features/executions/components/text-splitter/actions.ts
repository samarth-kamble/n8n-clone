"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { textSplitterChannel } from "@/inngest/channels/text-splitter";
import { inngest } from "@/inngest/client";

export type TextSplitterToken = Realtime.Token<
  typeof textSplitterChannel,
  ["status"]
>;

export async function fetchTextSplitterRealtimeToken(): Promise<TextSplitterToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: textSplitterChannel(),
    topics: ["status"],
  });

  return token;
}
