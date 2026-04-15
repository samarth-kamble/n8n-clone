import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Telegram sends updates in this format
    const message = body.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const initialData = {
      telegram_message: message.text || "",
      telegram_chat_id: String(message.chat?.id || ""),
      telegram_from: message.from
        ? `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim()
        : "Unknown",
      telegram_from_username: message.from?.username || "",
      telegram_date: message.date
        ? new Date(message.date * 1000).toISOString()
        : new Date().toISOString(),
      telegram_message_id: String(message.message_id || ""),
    };

    // Find all workflows with a TELEGRAM_TRIGGER node
    const workflows = await prisma.workflow.findMany({
      where: {
        nodes: {
          some: {
            type: "TELEGRAM_TRIGGER",
          },
        },
      },
    });

    // Trigger each matching workflow
    for (const workflow of workflows) {
      await inngest.send({
        name: "workflows/execute.workflow",
        data: {
          workflowId: workflow.id,
          initialData,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
