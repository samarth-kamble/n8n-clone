"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";

import { BaseExecutionNode } from "../base-execution-node";
import {
  DocumentLoaderDialog,
  type DocumentLoaderFormValues,
} from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchDocumentLoaderRealtimeToken } from "./actions";
import { DOCUMENT_LOADER_CHANNEL_NAME } from "@/inngest/channels/document-loader";
import { FileTextIcon } from "lucide-react";

type DocumentLoaderNodeData = {
  variableName?: string;
  documentId?: string;
};

type DocumentLoaderNodeType = Node<DocumentLoaderNodeData>;

export const DocumentLoaderNode = memo(
  (props: NodeProps<DocumentLoaderNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: DOCUMENT_LOADER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchDocumentLoaderRealtimeToken,
    });

    const handleOpenSettings = () => {
      setDialogOpen(true);
    };

    const handleSubmit = (values: DocumentLoaderFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            };
          }
          return node;
        })
      );
    };

    const nodeData = props.data;
    const description = nodeData.variableName
      ? `Variable: ${nodeData.variableName}`
      : "Not Configured";

    return (
      <>
        <DocumentLoaderDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          status={nodeStatus}
          {...props}
          id={props.id}
          icon={FileTextIcon}
          name="Document Loader"
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

DocumentLoaderNode.displayName = "DocumentLoaderNode";
