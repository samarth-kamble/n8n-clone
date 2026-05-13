"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { SplitIcon } from "lucide-react";

import { BaseExecutionNode } from "../base-execution-node";
import { TextSplitterDialog, type TextSplitterFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchTextSplitterRealtimeToken } from "./actions";
import { TEXT_SPLITTER_CHANNEL_NAME } from "@/inngest/channels/text-splitter";

type TextSplitterNodeData = {
  variableName?: string;
  sourceVariable?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  separator?: "newline" | "sentence" | "paragraph" | "custom";
};

type TextSplitterNodeType = Node<TextSplitterNodeData>;

export const TextSplitterNode = memo(
  (props: NodeProps<TextSplitterNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: TEXT_SPLITTER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchTextSplitterRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: TextSplitterFormValues) => {
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
    const description = nodeData.chunkSize
      ? `Chunk: ${nodeData.chunkSize} chars`
      : "Not Configured";

    return (
      <>
        <TextSplitterDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          status={nodeStatus}
          {...props}
          id={props.id}
          icon={SplitIcon}
          name="Text Splitter"
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

TextSplitterNode.displayName = "TextSplitterNode";
