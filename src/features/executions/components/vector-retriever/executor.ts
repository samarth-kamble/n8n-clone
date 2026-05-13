import { NonRetriableError } from "inngest";
import { Pinecone } from "@pinecone-database/pinecone";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import type { NodeExecutor } from "@/features/executions/lib/types";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { vectorRetrieverChannel } from "@/inngest/channels/vector-retriever";

type VectorRetrieverData = {
  variableName?: string;
  pineconeCredentialId?: string;
  pineconeIndexName?: string;
  queryVariable?: string;
  credentialId?: string;
  namespace?: string;
  topK?: number;
  embeddingModel?: string;
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export const vectorRetrieverExecutor: NodeExecutor<VectorRetrieverData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    vectorRetrieverChannel().status({ nodeId, status: "loading" })
  );

  if (
    !data.variableName ||
    !data.pineconeCredentialId ||
    !data.pineconeIndexName ||
    !data.queryVariable ||
    !data.credentialId
  ) {
    await publish(
      vectorRetrieverChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      "Vector Retriever: Missing required configuration"
    );
  }

  let query = getNestedValue(context, data.queryVariable);

  // If not found in context, fallback to treating the input as a literal string
  if (!query) {
    query = data.queryVariable;
  }

  if (typeof query !== "string") {
    await publish(
      vectorRetrieverChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      `Vector Retriever: Query "${data.queryVariable}" must be a string`
    );
  }

  // Get OpenAI credential for embeddings
  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential) {
    await publish(
      vectorRetrieverChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      "Vector Retriever: OpenAI credential not found"
    );
  }

  // Get Pinecone credential
  const pineconeCredential = await step.run("get-pinecone-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.pineconeCredentialId, userId },
    });
  });

  if (!pineconeCredential) {
    await publish(
      vectorRetrieverChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      "Vector Retriever: Pinecone credential not found"
    );
  }

  const pineconeApiKey = decrypt(pineconeCredential.value);
  const openai = createOpenAI({ apiKey: decrypt(credential.value) });
  const embeddingModel = data.embeddingModel || "text-embedding-3-small";
  const topK = data.topK || 5;

  try {
    // Combine embedding and querying into a single step to drastically reduce ngrok HTTP roundtrip latency
    const results = await step.run("vector-search", async () => {
      // 1. Embed the query
      const { embedding } = await embed({
        model: openai.embedding(embeddingModel),
        value: query,
      });

      // 2. Query Pinecone
      const pc = new Pinecone({ apiKey: pineconeApiKey });
      const index = pc.index(data.pineconeIndexName!);

      const queryOptions = {
        vector: embedding,
        topK,
        includeMetadata: true,
      };

      const queryResult = data.namespace
        ? await index.namespace(data.namespace).query(queryOptions)
        : await index.query(queryOptions);

      return queryResult.matches.map((match) => ({
        text: (match.metadata as { text?: string })?.text || "",
        score: match.score,
        id: match.id,
      }));
    });

    // Build the context string from retrieved chunks
    const contextText = results
      .map((r, i) => `[Source ${i + 1}] (Score: ${r.score?.toFixed(3)})\n${r.text}`)
      .join("\n\n---\n\n");

    await publish(
      vectorRetrieverChannel().status({ nodeId, status: "success" })
    );

    return {
      ...context,
      [data.variableName!]: {
        context: contextText,
        results,
        count: results.length,
      },
    };
  } catch (error) {
    await publish(
      vectorRetrieverChannel().status({ nodeId, status: "error" })
    );
    throw error;
  }
};
