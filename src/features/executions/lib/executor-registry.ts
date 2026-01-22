import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "./types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { GoogleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { StripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { OpenAiExecutor } from "../components/openai/executor";

export const executerRegistory: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerExecutor,
  [NodeType.GEMINI]: GeminiExecutor,
  [NodeType.OPENAI]: OpenAiExecutor,
  //   [NodeType.ANTHROPIC]: AnthropicExecutor,
};

export const getExecuter = (type: NodeType): NodeExecutor => {
  const executor = executerRegistory[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
