import { requireAuth } from "@/lib/auth-utils";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { SearchParams } from "nuqs/server";

import {
  WorkflowsContainer,
  WorkflowsList,
} from "@/features/workflows/components/workflows";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { workflowsParamsLoader } from "@/features/workflows/server/params";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await workflowsParamsLoader(searchParams);

  prefetchWorkflows(params);
  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default Page;
