"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";

import { BaseExecutionNode } from "../base-execution-node";
import {
  InsertPineconeDialog,
  type InsertPineconeFormValues,
} from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchInsertPineconeRealtimeToken } from "./actions";
import { INSERT_PINECONE_CHANNEL_NAME } from "@/inngest/channels/insert-pinecone";

type InsertPineconeNodeData = {
  variableName?: string;
  pineconeCredentialId?: string;
  pineconeIndexName?: string;
  sourceChunksVariable?: string;
  credentialId?: string;
  namespace?: string;
  embeddingModel?: string;
};

type InsertPineconeNodeType = Node<InsertPineconeNodeData>;

export const InsertPineconeNode = memo(
  (props: NodeProps<InsertPineconeNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: INSERT_PINECONE_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchInsertPineconeRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: InsertPineconeFormValues) => {
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
    const description = nodeData.pineconeIndexName
      ? `Index: ${nodeData.pineconeIndexName}`
      : "Not Configured";

    return (
      <>
        <InsertPineconeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          status={nodeStatus}
          {...props}
          id={props.id}
          icon={"/logos/pinecone.svg"}
          name="Insert Pinecone"
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

InsertPineconeNode.displayName = "InsertPineconeNode";
