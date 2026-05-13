import { NonRetriableError } from "inngest";
import { Pinecone } from "@pinecone-database/pinecone";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import type { NodeExecutor } from "@/features/executions/lib/types";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { insertPineconeChannel } from "@/inngest/channels/insert-pinecone";

type InsertPineconeData = {
  variableName?: string;
  pineconeCredentialId?: string;
  pineconeIndexName?: string;
  sourceChunksVariable?: string;
  credentialId?: string;
  namespace?: string;
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

export const insertPineconeExecutor: NodeExecutor<InsertPineconeData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    insertPineconeChannel().status({ nodeId, status: "loading" })
  );

  const missingFields = [];
  if (!data.variableName) missingFields.push("variableName");
  if (!data.pineconeCredentialId) missingFields.push("pineconeCredentialId");
  if (!data.pineconeIndexName) missingFields.push("pineconeIndexName");
  if (!data.sourceChunksVariable) missingFields.push("sourceChunksVariable");
  if (!data.credentialId) missingFields.push("credentialId");

  if (missingFields.length > 0) {
    await publish(
      insertPineconeChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      `Insert Pinecone: Missing required configuration fields: ${missingFields.join(", ")}`
    );
  }

  const chunks = getNestedValue(context, data.sourceChunksVariable!);

  if (!data.sourceChunksVariable || !chunks || !Array.isArray(chunks) || chunks.length === 0) {
    await publish(
      insertPineconeChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      `Insert Pinecone: Source chunks variable "${data.sourceChunksVariable || "unknown"}" not found or is empty`
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
      insertPineconeChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("Insert Pinecone: OpenAI credential not found");
  }

  // Get Pinecone credential
  const pineconeCredential = await step.run("get-pinecone-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.pineconeCredentialId, userId },
    });
  });

  if (!pineconeCredential) {
    await publish(
      insertPineconeChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("Insert Pinecone: Pinecone credential not found");
  }

  const pineconeApiKey = decrypt(pineconeCredential.value);
  const openai = createOpenAI({ apiKey: decrypt(credential.value) });
  const embeddingModel = data.embeddingModel || "text-embedding-3-small";

  try {
    // Generate embeddings for all chunks
    const embeddings = await step.run("generate-embeddings", async () => {
      const results: number[][] = [];
      for (const chunk of chunks as string[]) {
        const { embedding } = await embed({
          model: openai.embedding(embeddingModel),
          value: chunk,
        });
        results.push(embedding);
      }
      return results;
    });

    // Insert into Pinecone
    const upsertCount = await step.run("upsert-pinecone", async () => {
      const pc = new Pinecone({ apiKey: pineconeApiKey });
      const index = pc.index(data.pineconeIndexName!);

      const vectors = (chunks as string[]).map((chunk, i) => ({
        id: `${nodeId}-chunk-${i}`,
        values: embeddings[i],
        metadata: {
          text: chunk,
          chunkIndex: i,
          source: "workflow",
        },
      }));

      // Upsert in batches of 100
      const batchSize = 100;
      let totalUpserted = 0;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        if (data.namespace) {
          await index.namespace(data.namespace).upsert({ records: batch as any });
        } else {
          await index.upsert({ records: batch as any });
        }
        totalUpserted += batch.length;
      }

      return totalUpserted;
    });

    await publish(
      insertPineconeChannel().status({ nodeId, status: "success" })
    );

    return {
      ...context,
      [data.variableName!]: {
        upsertedCount: upsertCount,
        indexName: data.pineconeIndexName,
        namespace: data.namespace || "default",
      },
    };
  } catch (error) {
    await publish(
      insertPineconeChannel().status({ nodeId, status: "error" })
    );
    throw error;
  }
};
