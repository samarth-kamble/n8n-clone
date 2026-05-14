import React from "react";
import { FlaskConicalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";

import { useSetAtom } from "jotai";
import { isExecutingAtom } from "../store/atoms";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();
  const setIsExecuting = useSetAtom(isExecutingAtom);

  const handleExecute = () => {
    setIsExecuting(true);
    executeWorkflow.mutate({ id: workflowId }, {
      onSettled: () => {
        // Reset after a delay to simulate execution ending visually
        setTimeout(() => setIsExecuting(false), 5000);
      }
    });
  };

  return (
    <Button
      size={"lg"}
      disabled={executeWorkflow.isPending}
      onClick={handleExecute}
    >
      <FlaskConicalIcon className="size-4" />
      Execute Workflow
    </Button>
  );
};
