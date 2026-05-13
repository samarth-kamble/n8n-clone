import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { NodeExecutor } from "@/features/executions/lib/types";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { ragAgentChannel } from "@/inngest/channels/rag-agent";

type RagAgentData = {
  variableName?: string;
  credentialId?: string;
  contextVariable?: string;
  queryVariable?: string;
  chatHistoryVariable?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

const DEFAULT_RAG_SYSTEM_PROMPT = `You are a helpful AI assistant. Answer the user's question based ONLY on the provided context below. If the context doesn't contain relevant information, say "I don't have enough information to answer that question based on the available documents."

Always be accurate and cite specific parts of the context when possible.

## Retrieved Context:
{{context}}

{{#if chatHistory}}
## Previous Conversation:
{{chatHistory}}
{{/if}}`;

export const ragAgentExecutor: NodeExecutor<RagAgentData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    ragAgentChannel().status({ nodeId, status: "loading" })
  );

  if (!data.variableName || !data.credentialId || !data.contextVariable || !data.queryVariable) {
    await publish(
      ragAgentChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("RAG Agent: Missing required configuration");
  }

  const retrievedContext = getNestedValue(context, data.contextVariable);
  let query = getNestedValue(context, data.queryVariable);

  // If not found in context, fallback to treating the input as a literal string
  if (!query) {
    query = data.queryVariable;
  }

  if (typeof query !== "string") {
    await publish(
      ragAgentChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      `RAG Agent: Query "${data.queryVariable}" must be a string`
    );
  }

  if (retrievedContext === undefined || typeof retrievedContext !== "string") {
    await publish(
      ragAgentChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      `RAG Agent: Context variable "${data.contextVariable}" not found or invalid`
    );
  }



  // Get optional chat history
  let chatHistory = "";
  if (data.chatHistoryVariable) {
    const history = getNestedValue(context, data.chatHistoryVariable);
    if (history && typeof history === "string") {
      chatHistory = history;
    }
  }

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential) {
    await publish(
      ragAgentChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("RAG Agent: OpenAI credential not found");
  }

  const openai = createOpenAI({ apiKey: decrypt(credential.value) });
  const modelName = data.model || "gpt-4";
  const temperature = data.temperature ?? 0.7;

  // Build the system prompt with context injected
  const systemTemplate = data.systemPrompt || DEFAULT_RAG_SYSTEM_PROMPT;
  const compiledSystem = Handlebars.compile(systemTemplate)({
    ...context,
    context: retrievedContext,
    chatHistory,
  });

  try {
    // Wrap in a standard step.run to skip the heavy tracing overhead of step.ai.wrap
    const text = await step.run("generate-response", async () => {
      const { text: generatedText } = await generateText({
        model: openai(modelName),
        system: compiledSystem,
        prompt: query,
        temperature,
      });
      return generatedText;
    });

    await publish(
      ragAgentChannel().status({ nodeId, status: "success" })
    );

    return {
      ...context,
      [data.variableName!]: {
        text,
        model: modelName,
        contextUsed: true,
      },
    };
  } catch (error) {
    await publish(
      ragAgentChannel().status({ nodeId, status: "error" })
    );
    throw error;
  }
};
