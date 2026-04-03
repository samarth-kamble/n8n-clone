"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { documentLoaderChannel } from "@/inngest/channels/document-loader";
import { inngest } from "@/inngest/client";

export type DocumentLoaderToken = Realtime.Token<
  typeof documentLoaderChannel,
  ["status"]
>;

export async function fetchDocumentLoaderRealtimeToken(): Promise<DocumentLoaderToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: documentLoaderChannel(),
    topics: ["status"],
  });

  return token;
}
