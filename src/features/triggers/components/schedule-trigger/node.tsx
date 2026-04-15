"use client";

import { memo, useState } from "react";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { ClockIcon } from "lucide-react";

import { ScheduleTriggerDialog, ScheduleTriggerFormValues } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchScheduleTriggerRealtimeToken } from "./actions";
import { SCHEDULE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/schedule-trigger";
import { BaseTriggerNode } from "../base-trigger-node";

type ScheduleTriggerNodeData = {
  preset?: string;
  cronExpression?: string;
};

type ScheduleTriggerNodeType = Node<ScheduleTriggerNodeData>;

export const ScheduleTriggerNode = memo(
  (props: NodeProps<ScheduleTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: SCHEDULE_TRIGGER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchScheduleTriggerRealtimeToken,
    });

    const handleOpenSettings = () => {
      setDialogOpen(true);
    };

    const handleSubmit = (values: ScheduleTriggerFormValues) => {
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
    const description = nodeData.cronExpression
      ? `${nodeData.preset || "CUSTOM"}: ${nodeData.cronExpression}`
      : "Not Configured";

    return (
      <>
        <ScheduleTriggerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseTriggerNode
          {...props}
          icon={ClockIcon}
          name="Scheduled Trigger"
          description={description}
          status={nodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

ScheduleTriggerNode.displayName = "ScheduleTriggerNode";
