"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Node,
  Edge,
  EdgeChange,
  NodeChange,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "@xyflow/react";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor...." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor...." />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data: workflow } = useSuspenseWorkflow(workflowId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        fitView
        colorMode={isDark ? "dark" : "light"}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position={"top-right"}>
          <AddNodeButton />
        </Panel>
      </ReactFlow>
    </div>
  );
};
