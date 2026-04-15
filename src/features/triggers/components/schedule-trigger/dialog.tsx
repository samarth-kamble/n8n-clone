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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const presetToCron: Record<string, string> = {
  EVERY_MINUTE: "* * * * *",
  HOURLY: "0 * * * *",
  DAILY: "0 0 * * *",
  WEEKLY: "0 0 * * 1",
  CUSTOM: "",
};

const ScheduleTriggerSchema = z.object({
  preset: z.string().min(1, "Preset is required"),
  cronExpression: z.string().min(1, "Cron expression is required"),
});

export type ScheduleTriggerFormValues = z.infer<typeof ScheduleTriggerSchema>;

interface ScheduleTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ScheduleTriggerFormValues) => void;
  defaultValues?: Partial<ScheduleTriggerFormValues>;
}

export const ScheduleTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ScheduleTriggerDialogProps) => {
  const form = useForm<ScheduleTriggerFormValues>({
    resolver: zodResolver(ScheduleTriggerSchema),
    defaultValues: {
      preset: defaultValues?.preset || "EVERY_MINUTE",
      cronExpression: defaultValues?.cronExpression || "* * * * *",
    },
  });

  const preset = form.watch("preset");

  useEffect(() => {
    if (preset && preset !== "CUSTOM") {
      form.setValue("cronExpression", presetToCron[preset]);
    }
  }, [preset, form]);

  useEffect(() => {
    if (open) {
      form.reset({
        preset: defaultValues?.preset || "EVERY_MINUTE",
        cronExpression: defaultValues?.cronExpression || "* * * * *",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: ScheduleTriggerFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Trigger Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="preset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preset</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EVERY_MINUTE">Every Minute</SelectItem>
                      <SelectItem value="HOURLY">Every Hour</SelectItem>
                      <SelectItem value="DAILY">Every Day</SelectItem>
                      <SelectItem value="WEEKLY">Every Week</SelectItem>
                      <SelectItem value="CUSTOM">Custom Cron</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cronExpression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron Expression</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={preset !== "CUSTOM"}
                      placeholder="* * * * *"
                    />
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
