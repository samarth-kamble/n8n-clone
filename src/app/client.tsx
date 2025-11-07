"use client";

import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const Client = () => {
  const trpc = useTRPC();
  const { data: user } = useSuspenseQuery(trpc.getUsers.queryOptions());
  return <div>{JSON.stringify(user)}</div>;
};
export default Client;
