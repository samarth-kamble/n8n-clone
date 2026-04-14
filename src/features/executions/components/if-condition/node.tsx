"use client";

import { memo, useState } from "react";
import { type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { SplitIcon } from "lucide-react";

import { IfConditionDialog, IfConditionFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchIfConditionRealtimeToken } from "./actions";
import { IF_CONDITION_CHANNEL_NAME } from "@/inngest/channels/if-condition";
import { WorkflowNode } from "@/components/workflow-node";
import {
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";

type IfConditionNodeData = {
  variable?: string;
  operator?: string;
  value?: string;
};

type IfConditionNodeType = Node<IfConditionNodeData>;

export const IfConditionNode = memo((props: NodeProps<IfConditionNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: IF_CONDITION_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchIfConditionRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: IfConditionFormValues) => {
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

  const handleDelete = () => {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== props.id));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== props.id && edge.target !== props.id)
    );
  };

  const nodeData = props.data;
  const description = nodeData.variable
    ? `${nodeData.variable} ${nodeData.operator} ${nodeData.value || ""}`
    : "Not Configured";

  return (
    <>
      <IfConditionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <WorkflowNode
        name="IF Condition"
        description={description}
        onDelete={handleDelete}
        onSettings={handleOpenSettings}
      >
        <NodeStatusIndicator status={nodeStatus} variant="border">
          <BaseNode status={nodeStatus} onDoubleClick={handleOpenSettings}>
            <BaseNodeContent>
              <SplitIcon className="size-4 text-muted-foreground" />
              
              <BaseHandle
                id="target-1"
                type="target"
                position={Position.Left}
              />
              
              <BaseHandle
                id="true"
                type="source"
                position={Position.Right}
                style={{ top: '30%' }}
                className="!bg-emerald-500"
              />
              <span className="absolute right-[-35px] top-[26%] text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded">True</span>

              <BaseHandle
                id="false"
                type="source"
                position={Position.Right}
                style={{ top: '70%' }}
                className="!bg-rose-500"
              />
              <span className="absolute right-[-40px] top-[66%] text-[10px] bg-rose-100 text-rose-700 px-1 rounded">False</span>

            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    </>
  );
});

IfConditionNode.displayName = "IfConditionNode";
