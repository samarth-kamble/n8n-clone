import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow ID is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const emailData = {
      messageId: body.messageId,
      from: body.from,
      to: body.to,
      subject: body.subject,
      date: body.date,
      plainBody: body.plainBody,
      raw: body,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        gmailTrigger: emailData,
      },
    });

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Gmail Trigger processed successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Failed to process Gmail Trigger webhook",
    });
  }
}
