"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

import { Logout } from "./logout";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
      },
    })
  );

  const testAi = useMutation(trpc.testAi.mutationOptions());

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center dark:bg-black">
      <div className="flex flex-col gap-3 ">
        <span className="text-2xl font-bold flex flex-col items-center">
          Workflows
        </span>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <Button disabled={create.isPending} onClick={() => create.mutate()}>
          Create Workflow
        </Button>
        <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>
          Test AI
        </Button>
        {data && <Logout />}
      </div>
    </div>
  );
};

export default Page;
