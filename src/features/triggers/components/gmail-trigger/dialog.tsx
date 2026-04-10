"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGmailTriggerScript } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GmailTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  // Construct webhook url

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/gmail-trigger?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy webhook URL to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gmail Trigger</DialogTitle>
          <DialogDescription>
            Configure settings for the Gmail trigger node.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size={"icon"}
                variant={"outline"}
                onClick={copyToClipboard}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Google account and go to <a className="text-blue-500 hover:underline" href="https://script.google.com" target="_blank" rel="noreferrer">script.google.com</a></li>
              <li>Create a New Project</li>
              <li>Copy and Paste the Script Below into the editor</li>
              <li>Replace `WEBHOOK_URL` in the script with the URL above</li>
              <li>Click the "Triggers" clock icon on the left sidebar</li>
              <li>Click "Add Trigger" (bottom right)</li>
              <li>Choose: `checkNewEmailsAndSendToWebhook`, Event Source: `Time-driven`, Type: `Minutes timer` &#8594; e.g. `Every minute`</li>
              <li>Save and authorize the script permissions.</li>
            </ol>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-mono text-sm">Google App Script</h4>
            <Button
              type="button"
              variant={"outline"}
              onClick={async () => {
                const script = generateGmailTriggerScript(webhookUrl);
                try {
                  await navigator.clipboard.writeText(script);
                  toast.success("Script copied to clipboard");
                } catch (error) {
                  toast.error("Failed to copy script to clipboard");
                }
              }}
            >
              <CopyIcon className="size-4 mr-2" />
              Copy Google App Script
            </Button>
            <p className="text-xs text-muted-foreground">
              This script polls your inbox for unread messages and forwards them.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{gmailTrigger.from}}"}
                </code>
                - Sender Email
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{gmailTrigger.subject}}"}
                </code>
                - Subject Line
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{gmailTrigger.plainBody}}"}
                </code>
                - Email Text Content
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
