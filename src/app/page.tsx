import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { trpc } from "@/trpc/server";
import Client from "@/app/client";
import { Suspense } from "react";

const Page = async () => {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loadings....</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};
export default Page;
