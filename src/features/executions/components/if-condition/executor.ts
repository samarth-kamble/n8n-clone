import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/lib/types";
import { ifConditionChannel } from "@/inngest/channels/if-condition";

type IfConditionData = {
  variable?: string;
  operator?: string;
  value?: string;
};

export const ifConditionExecutor: NodeExecutor<IfConditionData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    ifConditionChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variable || !data.operator) {
    await publish(
      ifConditionChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("IF Condition node missing variable or operator");
  }

  try {
    const result = await step.run("evaluate-condition", async () => {
      const resolvedVariable = Handlebars.compile(data.variable || "")(context);
      const resolvedValue = Handlebars.compile(data.value || "")(context);
      
      let isTrue = false;

      switch (data.operator) {
        case "EQUALS":
          isTrue = resolvedVariable === resolvedValue;
          break;
        case "NOT_EQUALS":
          isTrue = resolvedVariable !== resolvedValue;
          break;
        case "CONTAINS":
          isTrue = resolvedVariable.includes(resolvedValue);
          break;
        case "NOT_CONTAINS":
          isTrue = !resolvedVariable.includes(resolvedValue);
          break;
        case "GREATER_THAN":
          isTrue = parseFloat(resolvedVariable) > parseFloat(resolvedValue);
          break;
        case "LESS_THAN":
          isTrue = parseFloat(resolvedVariable) < parseFloat(resolvedValue);
          break;
        default:
          isTrue = false;
      }

      return {
        ...context,
        $outputBranch: isTrue ? "true" : "false",
      };
    });

    await publish(
      ifConditionChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      ifConditionChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
