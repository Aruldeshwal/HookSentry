import { NextRequest, NextResponse } from "next/server";
import {
  toggleMutationRule,
  deleteMutationRule,
} from "@/lib/schemas-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string; ruleId: string }> }
) {
  try {
    const { ruleId } = await params;
    const body = await request.json().catch(() => ({}));
    const isActive = Boolean(body.isActive);

    await toggleMutationRule(ruleId, isActive);

    return NextResponse.json({ success: true, ruleId, isActive });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to toggle mutation rule", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string; ruleId: string }> }
) {
  try {
    const { ruleId } = await params;
    await deleteMutationRule(ruleId);

    return NextResponse.json({ success: true, ruleId, message: "Rule deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete mutation rule", details: String(error) },
      { status: 500 }
    );
  }
}
