import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
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

    const stripeData = {
      // Event Meatadata
      eventId: body.eventId,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object
    };

    await sendWorkflowExecution({
        workflowId,
        initialData: {
            stripe: stripeData
        }
    })

    return NextResponse.json({
        status: 200,
      success: true,
      message: "Stripe Webhook processed successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Failed to process Stripe Webhook",
    });
  }
}
