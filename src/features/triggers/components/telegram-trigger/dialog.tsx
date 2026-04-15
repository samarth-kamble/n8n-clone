"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const generateTelegramSetupScript = (webhookUrl: string, botToken: string) => {
  return `curl -X POST "https://api.telegram.org/bot${botToken}/setWebhook" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "${webhookUrl}"}'`;
};

export const TelegramTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params?.workflowId as string;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = `${baseUrl}/api/webhooks/telegram-trigger?workflowId=${workflowId}`;

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Telegram Trigger</DialogTitle>
          <DialogDescription>
            This trigger activates whenever a new message is received by your
            Telegram bot. Set up a webhook using the Telegram Bot API to point
            to your workflow&apos;s webhook endpoint.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-xs"
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

          <div className="rounded-md bg-muted p-4 text-sm space-y-2">
            <p className="font-medium">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Create a bot via{" "}
                <span className="font-mono text-xs">@BotFather</span> on
                Telegram
              </li>
              <li>Copy your Bot Token from BotFather</li>
              <li>Copy the webhook URL above</li>
              <li>
                Run the setup command below (replace {"<BOT_TOKEN>"} with your actual token)
              </li>
              <li>Messages to your bot will trigger this workflow</li>
            </ol>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const script = generateTelegramSetupScript(webhookUrl, "<BOT_TOKEN>");
              try {
                await navigator.clipboard.writeText(script);
                toast.success("Setup command copied to clipboard");
              } catch (error) {
                toast.error("Failed to copy setup command to clipboard");
              }
            }}
          >
            <CopyIcon className="size-4 mr-2" />
            Copy Setup Command
          </Button>
          <p className="text-xs text-muted-foreground">
            Replace {"<BOT_TOKEN>"} with your actual bot token before running
          </p>

          <div className="rounded-md border p-4 text-sm">
            <p className="font-medium mb-1">Available Variables:</p>
            <ul className="space-y-1 text-muted-foreground text-xs font-mono">
              <li>{"{{telegram_message}}"} - The message text</li>
              <li>{"{{telegram_chat_id}}"} - The chat ID</li>
              <li>{"{{telegram_from}}"} - Sender info</li>
              <li>{"{{telegram_from_username}}"} - Sender username</li>
              <li>{"{{telegram_message_id}}"} - Message ID</li>
              <li>{"{{telegram_date}}"} - Message timestamp</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
