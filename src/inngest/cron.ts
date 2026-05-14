import { inngest } from "./client";
import prisma from "@/lib/db";
import { NodeType } from "@/generated/prisma";
import { CronExpressionParser } from "cron-parser";
import { sendWorkflowExecution } from "./utils";

export const cronWorkflowTrigger = inngest.createFunction(
  {
    id: "cron-workflow-trigger",
  },
  {
    cron: "* * * * *", // Runs every minute
  },
  async ({ step }) => {
    // Fetch all active workflows that contain a SCHEDULE_TRIGGER node
    const workflows = await step.run("fetch-scheduled-workflows", async () => {
      // Find workflows that have at least one SCHEDULE_TRIGGER node
      return prisma.workflow.findMany({
        where: {
          // Assuming active workflows have a status or we just fetch all
          // If there is an 'isActive' flag, add it here.
          nodes: {
            some: {
              type: NodeType.SCHEDULE_TRIGGER,
            },
          },
        },
        include: {
          nodes: {
            where: {
              type: NodeType.SCHEDULE_TRIGGER,
            },
          },
        },
      });
    });

    const triggeredWorkflows = await step.run("check-cron-expressions", async () => {
      const now = new Date();
      // cron-parser checks if 'now' matches the cron expression
      const triggered: string[] = [];

      for (const workflow of workflows) {
        for (const node of workflow.nodes) {
          const data = node.data as { cronExpression?: string };
          if (data && data.cronExpression) {
            try {
              // Parse the cron expression
              const interval = CronExpressionParser.parse(data.cronExpression);
              // Check if the previous interval matches the current minute
              // cronParser.parseExpression().prev() gets the last date it should have run
              // We compare if it should have run within the current minute
              const prev = interval.prev().toDate();
              
              // If the cron's previous trigger is exactly the same minute as 'now', trigger it
              if (
                prev.getFullYear() === now.getFullYear() &&
                prev.getMonth() === now.getMonth() &&
                prev.getDate() === now.getDate() &&
                prev.getHours() === now.getHours() &&
                prev.getMinutes() === now.getMinutes()
              ) {
                triggered.push(workflow.id);
                break; // Trigger workflow once even if multiple matching triggers
              }
            } catch (err) {
              // Invalid cron expression, skip
              console.error(`Invalid cron expression in workflow ${workflow.id}: ${data.cronExpression}`);
            }
          }
        }
      }

      return triggered;
    });

    if (triggeredWorkflows.length > 0) {
      await step.run("dispatch-executions", async () => {
        // Dispatch all triggered workflows
        await Promise.all(
          triggeredWorkflows.map((workflowId) =>
            sendWorkflowExecution({ workflowId })
          )
        );
      });
    }

    return { triggeredCount: triggeredWorkflows.length, triggeredWorkflows };
  }
);
