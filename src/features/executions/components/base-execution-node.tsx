"use client";

import { memo, type ReactNode, useState } from "react";
import { type NodeProps, Position, useReactFlow, useEdges } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { PlusIcon, SettingsIcon, TrashIcon } from "lucide-react";

import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import {
  NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { NodeSelector } from "@/components/node-selector";

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    status = "initial",
    description,
    children,
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const edges = useEdges();
    const [selectorOpen, setSelectorOpen] = useState(false);

    const hasOutgoingEdge = edges.some((edge) => edge.source === id);

    const handleDelete = () => {
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id));
      setEdges((currentEdges) =>
        currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id
        )
      );
    };

    return (
      <div className="flex items-start">
        {/* Node + Name column */}
        <div className="flex flex-col items-center relative group w-[80px] overflow-visible">
          {/* Toolbar — centered above the node, visible on hover */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
            {onSettings && (
              <button
                onClick={onSettings}
                className="size-6 rounded flex items-center justify-center hover:bg-accent transition-colors cursor-pointer"
              >
                <SettingsIcon className="size-3.5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="size-6 rounded flex items-center justify-center hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <TrashIcon className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          <NodeStatusIndicator status={status} variant="border">
            <BaseNode
              status={status}
              onDoubleClick={onDoubleClick}
              className="!rounded-xl w-[80px] h-[80px]"
            >
              <BaseNodeContent className="items-center justify-center h-full p-0">
                {typeof Icon === "string" ? (
                  <Image src={Icon} alt={name} width={36} height={36} />
                ) : (
                  <Icon className="size-9 text-muted-foreground" />
                )}
                {children}
                <BaseHandle
                  id="target-1"
                  type="target"
                  position={Position.Left}
                />
                <BaseHandle
                  id="source-1"
                  type="source"
                  position={Position.Right}
                />
              </BaseNodeContent>
            </BaseNode>
          </NodeStatusIndicator>

          {/* Name + description below */}
          <div className="mt-2 text-center max-w-[160px]">
            <p className="text-[13px] font-semibold text-foreground leading-tight">
              {name}
            </p>
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Line + Plus — only when no outgoing edge */}
        {!hasOutgoingEdge && (
          <div className="flex items-center mt-[28px]">
            <div className="w-8 h-[2px] bg-border" />
            <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
              <div
                onClick={() => setSelectorOpen(true)}
                className="size-6 rounded bg-muted/80 border border-border flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
              >
                <PlusIcon className="size-3.5 text-muted-foreground" />
              </div>
            </NodeSelector>
          </div>
        )}
      </div>
    );
  }
);

BaseExecutionNode.displayName = "BaseExecutionNode";
