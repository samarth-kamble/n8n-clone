"use client";

import { NodeToolbar } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "./ui/button";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
}

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
}: WorkflowNodeProps) {
  return (
    <>
      {children}
    </>
  );
}
