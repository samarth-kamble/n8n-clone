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
import { Badge } from "@/components/ui/badge";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { FileIcon, UploadIcon, Loader2Icon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";
import { useDocuments, useUploadDocument } from "@/features/documents/hooks/use-documents";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  documentId: z.string().min(1, "Document is required"),
});

export type DocumentLoaderFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DocumentLoaderFormValues) => void;
  defaultValues?: Partial<DocumentLoaderFormValues>;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "text/plain": "TXT",
  "text/csv": "CSV",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export const DocumentLoaderDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: documents, isLoading: isLoadingDocuments } = useDocuments();
  const uploadDocument = useUploadDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<DocumentLoaderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      documentId: defaultValues.documentId || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        documentId: defaultValues.documentId || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "documentLoader";

  const handleSubmit = (values: DocumentLoaderFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadDocument.mutateAsync(file);
      if (result.document) {
        form.setValue("documentId", result.document.id);
        toast.success(`"${file.name}" uploaded successfully`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Document Loader Configuration</DialogTitle>
          <DialogDescription>
            Upload a document and make its content available to AI nodes.
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
                    <Input placeholder="documentLoader" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the document in other nodes:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadDocument.isPending ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Uploading & extracting text...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadIcon className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drop a file or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, TXT, CSV (max 5MB)
                  </p>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="documentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Document</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingDocuments || !documents?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a document" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documents?.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="size-4 text-muted-foreground" />
                            <span className="truncate">{doc.name}</span>
                            <Badge variant="secondary" className="text-[10px] ml-1">
                              {FILE_TYPE_LABELS[doc.mimeType] || doc.mimeType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a previously uploaded document or upload a new one
                    above.
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
