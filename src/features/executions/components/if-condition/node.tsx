"use client";

import { memo, useState } from "react";
import { type Node, type NodeProps, Position, useReactFlow, useEdges } from "@xyflow/react";
import { SplitIcon, PlusIcon, SettingsIcon, TrashIcon } from "lucide-react";

import { IfConditionDialog, IfConditionFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchIfConditionRealtimeToken } from "./actions";
import { IF_CONDITION_CHANNEL_NAME } from "@/inngest/channels/if-condition";
import {
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { NodeSelector } from "@/components/node-selector";

type IfConditionNodeData = {
  variable?: string;
  operator?:
    | "EQUALS"
    | "NOT_EQUALS"
    | "CONTAINS"
    | "NOT_CONTAINS"
    | "GREATER_THAN"
    | "LESS_THAN";
  value?: string;
};

type IfConditionNodeType = Node<IfConditionNodeData>;

export const IfConditionNode = memo((props: NodeProps<IfConditionNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();
  const edges = useEdges();

  // Check each branch independently
  const hasTrueEdge = edges.some(
    (edge) => edge.source === props.id && edge.sourceHandle === "true"
  );
  const hasFalseEdge = edges.some(
    (edge) => edge.source === props.id && edge.sourceHandle === "false"
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: IF_CONDITION_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchIfConditionRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: IfConditionFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return { ...node, data: { ...node.data, ...values } };
        }
        return node;
      })
    );
  };

  const handleDelete = () => {
    setNodes((n) => n.filter((node) => node.id !== props.id));
    setEdges((e) =>
      e.filter((edge) => edge.source !== props.id && edge.target !== props.id)
    );
  };

  return (
    <>
      <IfConditionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />
      <div className="flex items-start">
        {/* Node + Name column */}
        <div className="flex flex-col items-center relative group w-[80px] overflow-visible">
          {/* Toolbar — centered above the node */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
            <button
              onClick={handleOpenSettings}
              className="size-6 rounded flex items-center justify-center hover:bg-accent transition-colors cursor-pointer"
            >
              <SettingsIcon className="size-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={handleDelete}
              className="size-6 rounded flex items-center justify-center hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <TrashIcon className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          <NodeStatusIndicator status={nodeStatus} variant="border">
            <BaseNode
              status={nodeStatus}
              onDoubleClick={handleOpenSettings}
              className="!rounded-xl w-[80px] h-[80px]"
            >
              <BaseNodeContent className="items-center justify-center h-full p-0 relative">
                <SplitIcon className="size-9 text-emerald-500" />
                <BaseHandle id="target-1" type="target" position={Position.Left} />
                <BaseHandle
                  id="true"
                  type="source"
                  position={Position.Right}
                  style={{ top: "30%" }}
                  className="!bg-emerald-500"
                />
                <BaseHandle
                  id="false"
                  type="source"
                  position={Position.Right}
                  style={{ top: "70%" }}
                  className="!bg-rose-500"
                />
              </BaseNodeContent>
            </BaseNode>
          </NodeStatusIndicator>

          {/* Name below */}
          <div className="mt-2 text-center">
            <p className="text-[13px] font-semibold text-foreground leading-tight">
              If
            </p>
          </div>
        </div>

        {/* True/False branches — hide each when connected */}
        <div className="flex flex-col gap-4 mt-[14px]">
          {!hasTrueEdge && (
            <div className="flex items-center">
              <div className="w-6 h-[2px] bg-emerald-500/50" />
              <span className="text-[10px] text-muted-foreground font-medium mx-1">true</span>
              <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
                <div
                  onClick={() => setSelectorOpen(true)}
                  className="size-5 rounded bg-muted/80 border border-border flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                >
                  <PlusIcon className="size-2.5 text-muted-foreground" />
                </div>
              </NodeSelector>
            </div>
          )}
          {!hasFalseEdge && (
            <div className="flex items-center">
              <div className="w-6 h-[2px] bg-rose-500/50" />
              <span className="text-[10px] text-muted-foreground font-medium mx-1">false</span>
              <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
                <div
                  onClick={() => setSelectorOpen(true)}
                  className="size-5 rounded bg-muted/80 border border-border flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                >
                  <PlusIcon className="size-2.5 text-muted-foreground" />
                </div>
              </NodeSelector>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

IfConditionNode.displayName = "IfConditionNode";
