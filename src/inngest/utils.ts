import { Connection, Node } from "@/generated/prisma";
import toposort from "toposort";
import { inngest } from "./client";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[]
): Node[] => {
  // If the no connections, return node as-is (they are al independent)
  if (!connections || connections.length === 0) {
    return nodes;
  }

  // create edges array for toposort
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  // Add node with no connections as self-edges to ensure they are included
  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  // Peerform topological sorts
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);

    // Remove duplicates (From self-edges)
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error(`Cyclic dependency detected in workflow: `);
    }
    throw error;
  }

  // Map sorted IDs back to nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
  });
};
