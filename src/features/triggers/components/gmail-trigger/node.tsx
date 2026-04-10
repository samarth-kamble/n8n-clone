"use client";

import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";

import { BaseTriggerNode } from "../base-trigger-node";
import { GmailTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GMAIL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/gmail-trigger";
import { fetchGmailTriggerRealtimeToken } from "./actions";

export const GmailTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GMAIL_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGmailTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <GmailTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={"/logos/gmail.svg"}
        name="Gmail Trigger"
        description="Runs the flow when a new email arrives"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GmailTriggerNode.displayName = "GmailTriggerNode";
