import { NextRequest, NextResponse } from "next/server";
import {
  getMutationRulesByEndpointId,
  addMutationRule,
} from "@/lib/schemas-service";
import type { Operation } from "fast-json-patch";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  try {
    const { endpointId } = await params;
    const rules = await getMutationRulesByEndpointId(endpointId);
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load mutation rules", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  try {
    const { endpointId } = await params;
    const body = await request.json().catch(() => ({}));
    const name = (body.name as string) || "Manual RFC 6902 Patch Rule";
    const description = (body.description as string) || "";
    const eventTypeMatch = (body.eventTypeMatch as string) || "*";
    const patches = (body.patches as Operation[]) || [];

    if (!patches || patches.length === 0) {
      return NextResponse.json(
        { error: "At least one RFC 6902 patch operation is required." },
        { status: 400 }
      );
    }

    const newRule = await addMutationRule(endpointId, {
      name,
      description,
      eventTypeMatch,
      patches,
    });

    return NextResponse.json({ success: true, rule: newRule });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create mutation rule", details: String(error) },
      { status: 500 }
    );
  }
}
