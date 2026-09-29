import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/events-service";
import { analyzePoisonedEvent } from "@/lib/triage-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string; eventId: string }> }
) {
  try {
    const { endpointId, eventId } = await params;
    const event = await getEventById(endpointId, eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const triage = analyzePoisonedEvent(event);
    return NextResponse.json({ success: true, triage });
  } catch (error) {
    return NextResponse.json(
      { error: "Triage analysis failed", details: String(error) },
      { status: 500 }
    );
  }
}
