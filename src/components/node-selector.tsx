"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import {
  BrainCircuitIcon,
  CodeIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GlobeIcon,
  MousePointerIcon,
  SearchIcon,
  Share2Icon,
  ZapIcon,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NodeType } from "@/generated/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

type NodeCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  nodes: NodeTypeOption[];
  docsUrl?: string;
};

// ---------------------------------------------------------------------------
// Category data
// ---------------------------------------------------------------------------

const nodeCategories: NodeCategory[] = [
  {
    id: "triggers",
    label: "Triggers",
    icon: ZapIcon,
    nodes: [
      {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger Manually",
        description:
          "Runs the flow on clicking a button. Good for getting started quickly",
        icon: MousePointerIcon,
      },
      {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form Trigger",
        description: "Runs the flow when a Google Form is submitted",
        icon: "/logos/googleform.svg",
      },
      {
        type: NodeType.STRIPE_TRIGGER,
        label: "Stripe Trigger",
        description: "Runs the flow when a Stripe event is triggered",
        icon: "/logos/stripe.svg",
      },
      {
        type: NodeType.GMAIL_TRIGGER,
        label: "Gmail Trigger",
        description: "Runs the flow when a new email arrives",
        icon: "/logos/gmail.svg",
      },
    ],
  },
  {
    id: "ai",
    label: "AI",
    icon: BrainCircuitIcon,
    nodes: [
      {
        type: NodeType.OPENAI,
        label: "OpenAI",
        description: "Make requests to OpenAI API",
        icon: "/logos/openai.svg",
      },
      {
        type: NodeType.GEMINI,
        label: "Gemini",
        description: "Make requests to Gemini API",
        icon: "/logos/gemini.svg",
      },
      {
        type: NodeType.ANTHROPIC,
        label: "Anthropic",
        description: "Make requests to Anthropic API",
        icon: "/logos/anthropic.svg",
      },
    ],
  },
  {
    id: "social-media",
    label: "Social Media",
    icon: Share2Icon,
    nodes: [
      {
        type: NodeType.DISCORD,
        label: "Discord",
        description: "Send a message to Discord",
        icon: "/logos/discord.svg",
      },
      {
        type: NodeType.SLACK,
        label: "Slack",
        description: "Send a message to Slack",
        icon: "/logos/slack.svg",
      },
      {
        type: NodeType.GMAIL,
        label: "Gmail",
        description: "Send an email via Gmail",
        icon: "/logos/gmail.svg",
      },
    ],
  },
  {
    id: "developer-tools",
    label: "Developer Tools",
    icon: CodeIcon,
    nodes: [
      {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Make HTTP requests to external APIs",
        icon: GlobeIcon,
      },
    ],
  },
  {
    id: "data",
    label: "Data",
    icon: FileTextIcon,
    nodes: [
      {
        type: NodeType.DOCUMENT_LOADER,
        label: "Document Loader",
        description: "Load documents (PDF, DOCX, TXT, CSV) for AI processing",
        icon: FileTextIcon,
      },
    ],
  },
];

const DOCS_URL = "http://localhost:3000/docs";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const [search, setSearch] = useState("");

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return nodeCategories;

    return nodeCategories
      .map((category) => ({
        ...category,
        nodes: category.nodes.filter(
          (node) =>
            node.label.toLowerCase().includes(query) ||
            node.description.toLowerCase().includes(query) ||
            category.label.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.nodes.length > 0);
  }, [search]);

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      // check if trying to add a manual trigger when one already exists
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();

        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER,
        );

        if (hasManualTrigger) {
          toast.error("Only one manual trigger is allowed per workflow");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selection.type,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [setNodes, getNodes, screenToFlowPosition, onOpenChange],
  );

  // Reset search when sheet closes
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) setSearch("");
      onOpenChange(isOpen);
    },
    [onOpenChange],
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Add Node</SheetTitle>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mr-4"
            >
              <ExternalLinkIcon className="size-3.5" />
              Docs
            </a>
          </div>
          <SheetDescription>
            Choose a node to add to your workflow.
          </SheetDescription>
        </SheetHeader>

        {/* Search bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category accordion */}
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <SearchIcon className="size-8 mb-3 opacity-40" />
            <p className="text-sm font-medium">No nodes found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={nodeCategories.map((c) => c.id)}
            className="px-2"
          >
            {filteredCategories.map((category) => {
              const CategoryIcon = category.icon;

              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="px-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="size-4 text-muted-foreground" />
                      <span>{category.label}</span>
                      <Badge
                        variant="secondary"
                        className="ml-1 text-[10px] px-1.5 py-0 h-5 font-normal"
                      >
                        {category.nodes.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <div className="flex flex-col">
                      {category.nodes.map((nodeType) => {
                        const Icon = nodeType.icon;

                        return (
                          <div
                            key={nodeType.type}
                            className="w-full justify-start h-auto py-3.5 px-4 rounded-md cursor-pointer border-l-2 border-transparent hover:border-l-primary hover:bg-muted/50 transition-colors"
                            onClick={() => handleNodeSelect(nodeType)}
                          >
                            <div className="flex items-center gap-4 w-full overflow-hidden">
                              {typeof Icon === "string" ? (
                                <img
                                  src={Icon}
                                  alt={nodeType.label}
                                  className="size-5 object-contain rounded-sm"
                                />
                              ) : (
                                <Icon className="size-5" />
                              )}
                              <div className="flex flex-col items-start text-left">
                                <span className="font-medium text-sm">
                                  {nodeType.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {nodeType.description}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </SheetContent>
    </Sheet>
  );
}
