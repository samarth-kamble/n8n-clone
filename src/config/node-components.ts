import { NodeTypes } from "@xyflow/react";

import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { OpenAiNode } from "@/features/executions/components/openai/node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { SlackNode } from "@/features/executions/components/slack/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { DocumentLoaderNode } from "@/features/executions/components/document-loader/node";
import { GmailNode } from "@/features/executions/components/gmail/node";
import { GmailTriggerNode } from "@/features/triggers/components/gmail-trigger/node";
import { IfConditionNode } from "@/features/executions/components/if-condition/node";
import { TelegramNode } from "@/features/executions/components/telegram/node";
import { TelegramTriggerNode } from "@/features/triggers/components/telegram-trigger/node";
import { TextSplitterNode } from "@/features/executions/components/text-splitter/node";
import { InsertPineconeNode } from "@/features/executions/components/insert-pinecone/node";
import { VectorRetrieverNode } from "@/features/executions/components/vector-retriever/node";
import { RagAgentNode } from "@/features/executions/components/rag-agent/node";
import { ChatMemoryNode } from "@/features/executions/components/chat-memory/node";
import { ScheduleTriggerNode } from "@/features/triggers/components/schedule-trigger/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.DOCUMENT_LOADER]: DocumentLoaderNode,
  [NodeType.GMAIL]: GmailNode,
  [NodeType.GMAIL_TRIGGER]: GmailTriggerNode,
  [NodeType.IF_CONDITION]: IfConditionNode,
  [NodeType.SCHEDULE_TRIGGER]: ScheduleTriggerNode,
  [NodeType.TELEGRAM]: TelegramNode,
  [NodeType.TELEGRAM_TRIGGER]: TelegramTriggerNode,
  [NodeType.TEXT_SPLITTER]: TextSplitterNode,
  [NodeType.INSERT_PINECONE]: InsertPineconeNode,
  [NodeType.VECTOR_RETRIEVER]: VectorRetrieverNode,
  [NodeType.RAG_AGENT]: RagAgentNode,
  [NodeType.CHAT_MEMORY]: ChatMemoryNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
