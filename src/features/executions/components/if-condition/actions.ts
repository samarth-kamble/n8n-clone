"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { ifConditionChannel } from "@/inngest/channels/if-condition";
import { inngest } from "@/inngest/client";

export type IfConditionToken = Realtime.Token<
  typeof ifConditionChannel,
  ["status"]
>;

export async function fetchIfConditionRealtimeToken(): Promise<IfConditionToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: ifConditionChannel(),
    topics: ["status"],
  });

  return token;
}
