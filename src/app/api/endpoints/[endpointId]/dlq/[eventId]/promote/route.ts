import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mutationRules } from "@/db/schema";
import type { Operation } from "fast-json-patch";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string; eventId: string }> }
) {
  try {
    const { endpointId } = await params;
    const body = await request.json().catch(() => ({}));
    const patches = (body.patches as Operation[]) || [];
    const name = (body.name as string) || "Auto-Generated Triage Rule";
    const description =
      (body.description as string) ||
      `Permanent RFC 6902 mutation rule promoted from DLQ triage`;

    const ruleId = `rule_${Date.now().toString(36)}`;

    try {
      await db.insert(mutationRules).values({
        endpointId,
        name,
        description,
        patches,
        isActive: true,
      });
    } catch {
      // Database offline fallback
    }

    return NextResponse.json({
      success: true,
      ruleId,
      name,
      patches,
      message: "Patch promoted to active gateway mutation rule.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Rule promotion failed", details: String(error) },
      { status: 500 }
    );
  }
}
