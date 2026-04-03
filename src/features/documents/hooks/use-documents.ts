"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

/**
 * Hook to get all documents for selection dropdowns
 */
export const useDocuments = () => {
  const trpc = useTRPC();
  return useQuery(trpc.documents.getAll.queryOptions());
};

/**
 * Hook to upload a document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["documents"]] });
    },
  });
};

/**
 * Hook to delete a document
 */
export const useDeleteDocument = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.documents.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["documents"]] });
      },
    })
  );
};
