"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { SearchIcon } from "lucide-react";

import { BaseExecutionNode } from "../base-execution-node";
import {
  VectorRetrieverDialog,
  type VectorRetrieverFormValues,
} from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchVectorRetrieverRealtimeToken } from "./actions";
import { VECTOR_RETRIEVER_CHANNEL_NAME } from "@/inngest/channels/vector-retriever";

type VectorRetrieverNodeData = {
  variableName?: string;
  pineconeCredentialId?: string;
  pineconeIndexName?: string;
  queryVariable?: string;
  credentialId?: string;
  namespace?: string;
  topK?: number;
  embeddingModel?: string;
};

type VectorRetrieverNodeType = Node<VectorRetrieverNodeData>;

export const VectorRetrieverNode = memo(
  (props: NodeProps<VectorRetrieverNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: VECTOR_RETRIEVER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchVectorRetrieverRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: VectorRetrieverFormValues) => {
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
    const description = nodeData.topK
      ? `Top ${nodeData.topK} results`
      : "Not Configured";

    return (
      <>
        <VectorRetrieverDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          status={nodeStatus}
          {...props}
          id={props.id}
          icon={SearchIcon}
          name="Vector Retriever"
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

VectorRetrieverNode.displayName = "VectorRetrieverNode";
