import { NextRequest, NextResponse } from "next/server";
import { getTargetContractByEndpointId } from "@/lib/schemas-service";
import { testCustomPatches } from "@/lib/triage-engine";
import type { Operation } from "fast-json-patch";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  try {
    const { endpointId } = await params;
    const body = await request.json().catch(() => ({}));
    const rawPayload = (body.payload as Record<string, unknown>) || {};
    const patches = (body.patches as Operation[]) || [];

    const contract = await getTargetContractByEndpointId(endpointId);

    // Apply patches
    const patchResult = testCustomPatches(rawPayload, patches);
    if (!patchResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Patch application failed",
          details: patchResult.error,
        },
        { status: 400 }
      );
    }

    const healedPayload = patchResult.healedPayload;

    // Check required properties from JSON schema
    const requiredProps = (contract.jsonSchema.required as string[]) || [];
    const missingProps = requiredProps.filter(
      (prop) => healedPayload[prop] === undefined || healedPayload[prop] === null
    );

    const passedSchema = missingProps.length === 0;

    return NextResponse.json({
      success: true,
      passedSchema,
      missingProps,
      originalPayload: rawPayload,
      healedPayload,
      patchCount: patches.length,
      evaluatedContract: contract.schemaTitle,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Contract test execution failed", details: String(error) },
      { status: 500 }
    );
  }
}
