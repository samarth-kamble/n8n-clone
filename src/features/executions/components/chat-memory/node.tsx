"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { MessageSquareIcon } from "lucide-react";

import { BaseExecutionNode } from "../base-execution-node";
import { ChatMemoryDialog, type ChatMemoryFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchChatMemoryRealtimeToken } from "./actions";
import { CHAT_MEMORY_CHANNEL_NAME } from "@/inngest/channels/chat-memory";

type ChatMemoryNodeData = {
  variableName?: string;
  sessionId?: string;
  messageVariable?: string;
  maxMessages?: number;
  memoryType?: "buffer" | "summary";
};

type ChatMemoryNodeType = Node<ChatMemoryNodeData>;

export const ChatMemoryNode = memo(
  (props: NodeProps<ChatMemoryNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: CHAT_MEMORY_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchChatMemoryRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: ChatMemoryFormValues) => {
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
    const description = nodeData.maxMessages
      ? `Max: ${nodeData.maxMessages} msgs`
      : "Not Configured";

    return (
      <>
        <ChatMemoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          status={nodeStatus}
          {...props}
          id={props.id}
          icon={MessageSquareIcon}
          name="Chat Memory"
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

ChatMemoryNode.displayName = "ChatMemoryNode";
