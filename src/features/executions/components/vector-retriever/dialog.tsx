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
  pineconeCredentialId: z.string().min(1, "Pinecone credential is required"),
  pineconeIndexName: z.string().min(1, "Index name is required"),
  queryVariable: z.string().min(1, "Query variable is required"),
  credentialId: z.string().min(1, "OpenAI credential is required for embeddings"),
  namespace: z.string().optional(),
  topK: z.coerce.number().min(1).max(20),
  embeddingModel: z.string().min(1, "Embedding model is required"),
});

export type VectorRetrieverFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: VectorRetrieverFormValues) => void;
  defaultValues?: Partial<VectorRetrieverFormValues>;
}

export const VectorRetrieverDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.OPENAI);
  const { data: pineconeCredentials, isLoading: isLoadingPinecone } =
    useCredentialsByType(CredentialType.PINECONE);

  const form = useForm<VectorRetrieverFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      variableName: defaultValues.variableName || "",
      pineconeCredentialId: defaultValues.pineconeCredentialId || "",
      pineconeIndexName: defaultValues.pineconeIndexName || "",
      queryVariable: defaultValues.queryVariable || "",
      credentialId: defaultValues.credentialId || "",
      namespace: defaultValues.namespace || "",
      topK: defaultValues.topK || 5,
      embeddingModel: defaultValues.embeddingModel || "text-embedding-3-small",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        pineconeCredentialId: defaultValues.pineconeCredentialId || "",
        pineconeIndexName: defaultValues.pineconeIndexName || "",
        queryVariable: defaultValues.queryVariable || "",
        credentialId: defaultValues.credentialId || "",
        namespace: defaultValues.namespace || "",
        topK: defaultValues.topK || 5,
        embeddingModel: defaultValues.embeddingModel || "text-embedding-3-small",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "retrievedDocs";

  const handleSubmit = (values: VectorRetrieverFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Vector Retriever Configuration</DialogTitle>
          <DialogDescription>
            Search your Pinecone vector database for relevant context to feed
            into an AI model.
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
                    <Input placeholder="retrievedDocs" {...field} />
                  </FormControl>
                  <FormDescription>
                    Access results: {`{{${watchVariableName}.context}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pineconeCredentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pinecone Credential</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingPinecone || !pineconeCredentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pineconeCredentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/logos/pinecone.svg"
                              alt="Pinecone"
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
              name="pineconeIndexName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Index Name</FormLabel>
                  <FormControl>
                    <Input placeholder="my-rag-index" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="namespace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namespace (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="default" {...field} />
                  </FormControl>
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
                    The variable containing the user&apos;s question to search
                    for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topK"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Top K Results</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of most relevant chunks to retrieve (1-20)
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
                  <FormLabel>OpenAI Credential (for Embeddings)</FormLabel>
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
              name="embeddingModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embedding Model</FormLabel>
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
                      <SelectItem value="text-embedding-3-small">
                        text-embedding-3-small
                      </SelectItem>
                      <SelectItem value="text-embedding-3-large">
                        text-embedding-3-large
                      </SelectItem>
                      <SelectItem value="text-embedding-ada-002">
                        text-embedding-ada-002
                      </SelectItem>
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
