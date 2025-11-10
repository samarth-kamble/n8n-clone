import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

import { createTRPCRouter, protectedProcedure } from "../init";

export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "samarth@sam.com",
      },
    });

    return { success: true, message: "Workflow creation initiated" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
