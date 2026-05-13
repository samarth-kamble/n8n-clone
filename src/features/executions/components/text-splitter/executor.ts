import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/lib/types";
import { textSplitterChannel } from "@/inngest/channels/text-splitter";

type TextSplitterData = {
  variableName?: string;
  sourceVariable?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  separator?: "newline" | "sentence" | "paragraph" | "custom";
};

const SEPARATORS: Record<string, string> = {
  newline: "\n",
  sentence: "(?<=[.!?])\\s+",
  paragraph: "\n\n",
  custom: " ",
};

function splitText(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  separator: string
): string[] {
  // Split text by separator
  const regex = new RegExp(separator, "g");
  const segments = text.split(regex).filter((s) => s.trim().length > 0);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const segment of segments) {
    if (currentChunk.length + segment.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Apply overlap: keep the last `chunkOverlap` characters
      if (chunkOverlap > 0) {
        currentChunk = currentChunk.slice(-chunkOverlap) + " " + segment;
      } else {
        currentChunk = segment;
      }
    } else {
      currentChunk += (currentChunk ? " " : "") + segment;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export const textSplitterExecutor: NodeExecutor<TextSplitterData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    textSplitterChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      textSplitterChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("Text Splitter: Variable name is missing");
  }

  if (!data.sourceVariable) {
    await publish(
      textSplitterChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError("Text Splitter: Source variable is missing");
  }

  const sourceText = getNestedValue(context, data.sourceVariable);

  if (!sourceText || typeof sourceText !== "string") {
    await publish(
      textSplitterChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      `Text Splitter: Source variable "${data.sourceVariable}" not found or is not a string`
    );
  }

  const chunkSize = data.chunkSize || 1000;
  const chunkOverlap = data.chunkOverlap || 200;
  const separator = SEPARATORS[data.separator || "newline"] || "\n";

  const chunks = await step.run("split-text", () => {
    return splitText(sourceText, chunkSize, chunkOverlap, separator);
  });

  await publish(
    textSplitterChannel().status({
      nodeId,
      status: "success",
    })
  );

  return {
    ...context,
    [data.variableName!]: {
      chunks,
      count: chunks.length,
      chunkSize,
      chunkOverlap,
    },
  };
};
