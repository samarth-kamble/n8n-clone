"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BrainCircuitIcon } from "lucide-react";

import { BaseExecutionNode } from "../base-execution-node";
import { RagAgentDialog, type RagAgentFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchRagAgentRealtimeToken } from "./actions";
import { RAG_AGENT_CHANNEL_NAME } from "@/inngest/channels/rag-agent";

type RagAgentNodeData = {
  variableName?: string;
  credentialId?: string;
  contextVariable?: string;
  queryVariable?: string;
  chatHistoryVariable?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
};

type RagAgentNodeType = Node<RagAgentNodeData>;

export const RagAgentNode = memo((props: NodeProps<RagAgentNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: RAG_AGENT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchRagAgentRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: RagAgentFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: { ...node.data, ...values },
          };
        }
        return node;
      })
    );
  };

  const nodeData = props.data;
  const description = nodeData.model
    ? `Model: ${nodeData.model}`
    : "Not Configured";

  return (
    <>
      <RagAgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        status={nodeStatus}
        {...props}
        id={props.id}
        icon={BrainCircuitIcon}
        name="RAG Agent"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

RagAgentNode.displayName = "RagAgentNode";
