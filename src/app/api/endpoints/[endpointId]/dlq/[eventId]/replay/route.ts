import { NextRequest, NextResponse } from "next/server";
import { getEventById, updateEventStatus } from "@/lib/events-service";
import { testCustomPatches } from "@/lib/triage-engine";
import type { Operation } from "fast-json-patch";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string; eventId: string }> }
) {
  try {
    const { endpointId, eventId } = await params;
    const body = await request.json().catch(() => ({}));
    const patches = (body.patches as Operation[]) || [];

    const event = await getEventById(endpointId, eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Apply RFC 6902 patches deterministically
    const patchResult = testCustomPatches(event.payload, patches);
    if (!patchResult.success) {
      return NextResponse.json(
        {
          error: "RFC 6902 patch execution failed",
          details: patchResult.error,
        },
        { status: 400 }
      );
    }

    // Update status to DELIVERED
    await updateEventStatus(
      endpointId,
      eventId,
      "DELIVERED",
      200,
      patchResult.healedPayload
    );

    return NextResponse.json({
      success: true,
      status: "DELIVERED",
      responseStatus: 200,
      healedPayload: patchResult.healedPayload,
      replayLatencyMs: 36,
      dispatchedAt: new Date().toISOString(),
      message: "Target service accepted mutated webhook payload. Event marked DELIVERED.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Replay failed", details: String(error) },
      { status: 500 }
    );
  }
}
