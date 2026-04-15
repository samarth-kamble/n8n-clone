"use client";

import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";

import { BaseTriggerNode } from "../base-trigger-node";
import { TelegramTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { TELEGRAM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/telegram-trigger";
import { fetchTelegramTriggerRealtimeToken } from "./actions";

export const TelegramTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: TELEGRAM_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchTelegramTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <TelegramTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={"/logos/telegram.svg"}
        name="Telegram Trigger"
        description="Runs the flow when a message is received"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

TelegramTriggerNode.displayName = "TelegramTriggerNode";
