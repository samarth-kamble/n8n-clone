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
  sourceVariable: z.string().min(1, "Source variable is required"),
  chunkSize: z.coerce.number().min(100).max(8000),
  chunkOverlap: z.coerce.number().min(0).max(2000),
  separator: z.enum(["newline", "sentence", "paragraph", "custom"]),
});

export type TextSplitterFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TextSplitterFormValues) => void;
  defaultValues?: Partial<TextSplitterFormValues>;
}

export const TextSplitterDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<TextSplitterFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      variableName: defaultValues.variableName || "",
      sourceVariable: defaultValues.sourceVariable || "",
      chunkSize: defaultValues.chunkSize || 1000,
      chunkOverlap: defaultValues.chunkOverlap || 200,
      separator: defaultValues.separator || "newline",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        sourceVariable: defaultValues.sourceVariable || "",
        chunkSize: defaultValues.chunkSize || 1000,
        chunkOverlap: defaultValues.chunkOverlap || 200,
        separator: defaultValues.separator || "newline",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "textChunks";

  const handleSubmit = (values: TextSplitterFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Text Splitter Configuration</DialogTitle>
          <DialogDescription>
            Split document text into smaller chunks for vector embedding.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="textChunks" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the chunks in other nodes:{" "}
                    {`{{${watchVariableName}.chunks}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceVariable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Variable</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="documentLoader.text"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The variable containing the text to split (e.g.,
                    documentLoader.text)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chunkSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chunk Size</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Characters per chunk</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chunkOverlap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chunk Overlap</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Overlap between chunks</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="separator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Separator</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select separator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="newline">Newline (\n)</SelectItem>
                      <SelectItem value="sentence">
                        Sentence (. ! ?)
                      </SelectItem>
                      <SelectItem value="paragraph">
                        Paragraph (\n\n)
                      </SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
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
