import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "./types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { GoogleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { StripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openAiExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { discordExecutor } from "../components/discord/executor";
import { slackExecutor } from "../components/slack/executor";
import { documentLoaderExecutor } from "../components/document-loader/executor";
import { gmailExecutor } from "../components/gmail/executor";
import { gmailTriggerExecutor } from "@/features/triggers/components/gmail-trigger/executor";
import { ifConditionExecutor } from "../components/if-condition/executor";

export const executerRegistory: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
  [NodeType.AI_AGENT]: manualTriggerExecutor,
  [NodeType.DOCUMENT_LOADER]: documentLoaderExecutor,
  [NodeType.GMAIL]: gmailExecutor,
  [NodeType.GMAIL_TRIGGER]: gmailTriggerExecutor,
  [NodeType.IF_CONDITION]: ifConditionExecutor,
};

export const getExecuter = (type: NodeType): NodeExecutor => {
  const executor = executerRegistory[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
