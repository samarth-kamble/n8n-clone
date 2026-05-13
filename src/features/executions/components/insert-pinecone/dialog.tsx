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
  sourceChunksVariable: z.string().min(1, "Source chunks variable is required"),
  credentialId: z.string().min(1, "OpenAI credential is required for embeddings"),
  namespace: z.string().optional(),
  embeddingModel: z.string().min(1, "Embedding model is required"),
});

export type InsertPineconeFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InsertPineconeFormValues) => void;
  defaultValues?: Partial<InsertPineconeFormValues>;
}

export const InsertPineconeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.OPENAI);
  const { data: pineconeCredentials, isLoading: isLoadingPinecone } =
    useCredentialsByType(CredentialType.PINECONE);

  const form = useForm<InsertPineconeFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      variableName: defaultValues.variableName || "",
      pineconeCredentialId: defaultValues.pineconeCredentialId || "",
      pineconeIndexName: defaultValues.pineconeIndexName || "",
      sourceChunksVariable: defaultValues.sourceChunksVariable || "",
      credentialId: defaultValues.credentialId || "",
      namespace: defaultValues.namespace || "",
      embeddingModel: defaultValues.embeddingModel || "text-embedding-3-small",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        pineconeCredentialId: defaultValues.pineconeCredentialId || "",
        pineconeIndexName: defaultValues.pineconeIndexName || "",
        sourceChunksVariable: defaultValues.sourceChunksVariable || "",
        credentialId: defaultValues.credentialId || "",
        namespace: defaultValues.namespace || "",
        embeddingModel: defaultValues.embeddingModel || "text-embedding-3-small",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: InsertPineconeFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Insert into Pinecone</DialogTitle>
          <DialogDescription>
            Embed text chunks and store them in a Pinecone vector database for
            retrieval.
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
                    <Input placeholder="pineconeResult" {...field} />
                  </FormControl>
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
                  <FormDescription>
                    The name of your Pinecone index
                  </FormDescription>
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
                  <FormDescription>
                    Organize vectors by namespace within the index
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceChunksVariable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Chunks Variable</FormLabel>
                  <FormControl>
                    <Input placeholder="textChunks.chunks" {...field} />
                  </FormControl>
                  <FormDescription>
                    The variable containing text chunks array from the Text
                    Splitter node
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
                  <FormDescription>
                    Used to generate embeddings with OpenAI
                  </FormDescription>
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
                        text-embedding-3-small (1536 dims)
                      </SelectItem>
                      <SelectItem value="text-embedding-3-large">
                        text-embedding-3-large (3072 dims)
                      </SelectItem>
                      <SelectItem value="text-embedding-ada-002">
                        text-embedding-ada-002 (1536 dims)
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
