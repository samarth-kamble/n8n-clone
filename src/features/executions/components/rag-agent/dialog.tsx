"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";
import Image from "next/image";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  contextVariable: z.string().min(1, "Context variable is required"),
  queryVariable: z.string().min(1, "Query variable is required"),
  chatHistoryVariable: z.string().optional(),
  systemPrompt: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  temperature: z.coerce.number().min(0).max(2),
});

export type RagAgentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RagAgentFormValues) => void;
  defaultValues?: Partial<RagAgentFormValues>;
}

export const RagAgentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.OPENAI);

  const form = useForm<RagAgentFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      contextVariable: defaultValues.contextVariable || "",
      queryVariable: defaultValues.queryVariable || "",
      chatHistoryVariable: defaultValues.chatHistoryVariable || "",
      systemPrompt: defaultValues.systemPrompt || "",
      model: defaultValues.model || "gpt-4",
      temperature: defaultValues.temperature ?? 0.7,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        contextVariable: defaultValues.contextVariable || "",
        queryVariable: defaultValues.queryVariable || "",
        chatHistoryVariable: defaultValues.chatHistoryVariable || "",
        systemPrompt: defaultValues.systemPrompt || "",
        model: defaultValues.model || "gpt-4",
        temperature: defaultValues.temperature ?? 0.7,
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "ragResponse";

  const handleSubmit = (values: RagAgentFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RAG Agent Configuration</DialogTitle>
          <DialogDescription>
            Combine retrieved context with an AI model to generate
            context-aware answers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 mt-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="ragResponse" {...field} />
                  </FormControl>
                  <FormDescription>
                    Access: {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI Credential</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCredentials || !credentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/logos/openai.svg"
                              alt="OpenAI"
                              width={16}
                              height={16}
                            />
                            {credential.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contextVariable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context Variable</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="retrievedDocs.context"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The variable containing the retrieved context from Vector
                    Retriever
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="queryVariable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Query Variable</FormLabel>
                  <FormControl>
                    <Input placeholder="userQuery" {...field} />
                  </FormControl>
                  <FormDescription>
                    The variable containing the user&apos;s question
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chatHistoryVariable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat History Variable (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="chatMemory.history"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: variable containing chat history from the Chat
                    Memory node
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant that answers questions based on the provided context. Always cite your sources."
                      className="min-h-[80px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Custom instructions for the AI. The retrieved context
                    will be injected automatically.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature ({field.value})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower = more focused, Higher = more creative
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
