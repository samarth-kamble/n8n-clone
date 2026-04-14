"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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

const IfConditionSchema = z.object({
  variable: z.string().min(1, "Variable is required"),
  operator: z.enum([
    "EQUALS",
    "NOT_EQUALS",
    "CONTAINS",
    "NOT_CONTAINS",
    "GREATER_THAN",
    "LESS_THAN",
  ]),
  value: z.string().optional(),
});

export type IfConditionFormValues = z.infer<typeof IfConditionSchema>;

interface IfConditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: IfConditionFormValues) => void;
  defaultValues?: Partial<IfConditionFormValues>;
}

export const IfConditionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: IfConditionDialogProps) => {
  const form = useForm<IfConditionFormValues>({
    resolver: zodResolver(IfConditionSchema),
    defaultValues: {
      variable: defaultValues?.variable || "{{variable}}",
      operator: defaultValues?.operator || "EQUALS",
      value: defaultValues?.value || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variable: defaultValues?.variable || "{{variable}}",
        operator: defaultValues?.operator || "EQUALS",
        value: defaultValues?.value || "",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: IfConditionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>IF Condition Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="variable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable to Check</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="{{email_subject}}" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EQUALS">Equals</SelectItem>
                      <SelectItem value="NOT_EQUALS">Not Equals</SelectItem>
                      <SelectItem value="CONTAINS">Contains</SelectItem>
                      <SelectItem value="NOT_CONTAINS">Not Contains</SelectItem>
                      <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                      <SelectItem value="LESS_THAN">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Urgent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
