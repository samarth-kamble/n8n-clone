import { createTRPCRouter } from "../init";
import { workflowsRouter } from "@/features/workflows/server/router";
import { credentialsRouter } from "@/features/credentials/server/router";
import { executionsRouter } from "@/features/executions/server/router";
import { documentsRouter } from "@/features/documents/server/router";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
  documents: documentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
