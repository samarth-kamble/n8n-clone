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

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  sessionId: z.string().min(1, "Session ID variable is required"),
  messageVariable: z.string().optional(),
  maxMessages: z.coerce.number().min(2).max(50),
  memoryType: z.enum(["buffer", "summary"]),
});

export type ChatMemoryFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ChatMemoryFormValues) => void;
  defaultValues?: Partial<ChatMemoryFormValues>;
}

export const ChatMemoryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<ChatMemoryFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      variableName: defaultValues.variableName || "",
      sessionId: defaultValues.sessionId || "",
      messageVariable: defaultValues.messageVariable || "",
      maxMessages: defaultValues.maxMessages || 10,
      memoryType: defaultValues.memoryType || "buffer",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        sessionId: defaultValues.sessionId || "",
        messageVariable: defaultValues.messageVariable || "",
        maxMessages: defaultValues.maxMessages || 10,
        memoryType: defaultValues.memoryType || "buffer",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "chatMemory";

  const handleSubmit = (values: ChatMemoryFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Memory Configuration</DialogTitle>
          <DialogDescription>
            Manage conversation history to give the AI memory of previous
            messages in a session.
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
                    <Input placeholder="chatMemory" {...field} />
                  </FormControl>
                  <FormDescription>
                    Access history: {`{{${watchVariableName}.history}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session ID Variable</FormLabel>
                  <FormControl>
                    <Input placeholder="trigger.chatId" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier to group messages by conversation
                    (e.g., Telegram chat ID)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messageVariable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Current Message Variable (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="trigger.message" {...field} />
                  </FormControl>
                  <FormDescription>
                    The variable containing the new message to add to
                    memory
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxMessages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Messages</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum number of messages to retain in memory (2-50)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memoryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memory Type</FormLabel>
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
                      <SelectItem value="buffer">
                        Buffer (Store exact messages)
                      </SelectItem>
                      <SelectItem value="summary">
                        Summary (Summarize older messages)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Buffer keeps raw messages; Summary compresses older
                    ones
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
