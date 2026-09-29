import { NextRequest, NextResponse } from "next/server";
import { recordSimulatedEvent, type WebhookEventView } from "@/lib/events-service";
import { db } from "@/db";
import { webhookEvents } from "@/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  try {
    const { endpointId } = await params;
    const body = await request.json().catch(() => ({}));
    const simulationType = (body.type as "valid" | "drift_422" | "error_500") || "valid";

    const timestamp = new Date();
    const shortId = Math.random().toString(36).substring(2, 9);
    const idempKey = `idemp_sim_${Date.now().toString(36)}_${shortId}`;

    let newEvent: WebhookEventView;

    if (simulationType === "drift_422") {
      newEvent = {
        id: `evt_drift_${shortId}`,
        endpointId,
        idempotencyKey: idempKey,
        eventType: "customer.subscription.updated",
        payload: {
          id: `sub_${shortId}`,
          object: "subscription",
          status: "active",
          // Schema Drift: field 'customer_reference' was provided instead of required 'customer_id'
          customer_reference: `cus_ref_${shortId}`,
          amount_cents: 9900,
          currency: "usd",
        },
        headers: {
          "content-type": "application/json",
          "x-hooksentry-simulated": "true",
          "x-signature-hmac-sha256": "47a9ef02b1c8...",
          "user-agent": "HookSentry-Simulator/2.0",
        },
        status: "FAILED_DLQ",
        attempts: 3,
        maxAttempts: 3,
        lastError: "HTTP 422 Unprocessable Entity: Downstream contract validation failed: Missing required property 'customer_id' at root level.",
        responseStatus: 422,
        latencyMs: 114,
        createdAt: timestamp.toISOString(),
      };
    } else if (simulationType === "error_500") {
      newEvent = {
        id: `evt_err_${shortId}`,
        endpointId,
        idempotencyKey: idempKey,
        eventType: "invoice.payment_action_required",
        payload: {
          id: `in_${shortId}`,
          amount_due: 34500,
          attempt_count: 2,
          hosted_invoice_url: `https://pay.example.com/invoice/${shortId}`,
        },
        headers: {
          "content-type": "application/json",
          "x-hooksentry-simulated": "true",
        },
        status: "RETRYING",
        attempts: 1,
        maxAttempts: 3,
        lastError: "HTTP 500 Internal Server Error: Database transaction lock timeout on downstream microservice.",
        responseStatus: 500,
        latencyMs: 1850,
        createdAt: timestamp.toISOString(),
      };
    } else {
      // 200 DELIVERED
      newEvent = {
        id: `evt_ok_${shortId}`,
        endpointId,
        idempotencyKey: idempKey,
        eventType: "payment_intent.succeeded",
        payload: {
          id: `pi_${shortId}`,
          object: "payment_intent",
          amount: 8500,
          currency: "usd",
          status: "succeeded",
          customer_id: `cus_${shortId}`,
        },
        headers: {
          "content-type": "application/json",
          "x-hooksentry-simulated": "true",
          "x-signature-hmac-sha256": "81fca921...",
        },
        status: "DELIVERED",
        attempts: 1,
        maxAttempts: 3,
        lastError: null,
        responseStatus: 200,
        latencyMs: 32,
        createdAt: timestamp.toISOString(),
      };
    }

    // Record in-memory
    recordSimulatedEvent(newEvent);

    // Persist to Postgres if available
    try {
      await db.insert(webhookEvents).values({
        endpointId,
        idempotencyKey: newEvent.idempotencyKey,
        payload: newEvent.payload,
        headers: newEvent.headers,
        status: newEvent.status,
        attempts: newEvent.attempts,
        maxAttempts: newEvent.maxAttempts,
        lastError: newEvent.lastError,
        responseStatus: newEvent.responseStatus,
        createdAt: timestamp,
      });
    } catch {
      // DB offline in local dev mode, fallback works seamlessly
    }

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    return NextResponse.json(
      { error: "Simulation failed", details: String(error) },
      { status: 500 }
    );
  }
}
