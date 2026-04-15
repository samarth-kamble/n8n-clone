import type { NodeExecutor } from "@/features/executions/lib/types";
import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";

type ScheduleTriggerData = Record<string, unknown>;

export const scheduleTriggerExecutor: NodeExecutor<ScheduleTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    scheduleTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );
  const result = await step.run("schedule-trigger", async () => {
    return {
      ...context,
      triggerTime: new Date().toISOString(),
    };
  });

  await publish(
    scheduleTriggerChannel().status({
      nodeId,
      status: "success",
    })
  );

  return result;
};
