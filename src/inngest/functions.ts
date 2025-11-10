import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Function the video
    await step.sleep("wait-a-moment", "5s");

    // Transcibing
    await step.sleep("wait-a-moment", "5s");

    // Sending transcription to AI
    await step.sleep("wait-a-moment", "5s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "workflow-from-inngest",
        },
      });
    });
  }
);
