"use client";

import { useState } from "react";
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import type { MutationRuleView } from "@/lib/schemas-service";

interface InteractiveContractTesterProps {
  endpointId: string;
  rules: MutationRuleView[];
}

export function InteractiveContractTester({
  endpointId,
  rules,
}: InteractiveContractTesterProps) {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    rules[0]?.id || "auto"
  );

  const samplePayload = {
    order_number: 10429,
    line_items: [{ sku: "SKU-PRO-KEY-01", quantity: 2, price: "45.00" }],
    billing_customer: {
      id: "cust_shopify_88910",
      email: "buyer@enterprise.corp",
    },
    total_price: "90.00",
  };

  const [inputPayloadText, setInputPayloadText] = useState(
    JSON.stringify(samplePayload, null, 2)
  );

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [testResult, setTestResult] = useState<{
    passedSchema: boolean;
    missingProps: string[];
    healedPayload: Record<string, unknown>;
    patchCount: number;
    evaluatedContract: string;
  } | null>(null);

  const [copiedHealed, setCopiedHealed] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHealed(true);
    setTimeout(() => setCopiedHealed(false), 2000);
  };

  const handleTestEvaluation = async () => {
    setIsEvaluating(true);
    try {
      let parsedPayload: Record<string, unknown>;
      try {
        parsedPayload = JSON.parse(inputPayloadText);
      } catch {
        alert("Input payload is not valid JSON.");
        setIsEvaluating(false);
        return;
      }

      // Find the rule to apply
      const selectedRule = rules.find((r) => r.id === selectedRuleId) || rules[0];
      const patches = selectedRule ? selectedRule.patches : [];

      const res = await fetch(`/api/endpoints/${endpointId}/schemas/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: parsedPayload,
          patches,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult(data);
      } else {
        alert(data.error || "Evaluation failed");
      }
    } catch (err) {
      console.error("Test evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-lg flex flex-col font-sans">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            In-Flight Contract & Mutation Sandbox
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            Real-Time Evaluation
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400">Target Rule:</span>
          <select
            value={selectedRuleId}
            onChange={(e) => setSelectedRuleId(e.target.value)}
            className="rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
          >
            {rules.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
        {/* Left: Input Payload */}
        <div className="p-4 flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">
              Raw Ingest Payload (Simulated)
            </span>
            <button
              onClick={() => setInputPayloadText(JSON.stringify(samplePayload, null, 2))}
              className="text-[11px] text-zinc-400 hover:text-emerald-400 transition"
            >
              Reset Sample
            </button>
          </div>
          <textarea
            value={inputPayloadText}
            onChange={(e) => setInputPayloadText(e.target.value)}
            rows={12}
            className="w-full bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3 text-zinc-300 font-mono text-xs focus:outline-none focus:border-emerald-500/50 resize-y"
          />

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleTestEvaluation}
              disabled={isEvaluating}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-zinc-950 transition shadow-sm"
            >
              {isEvaluating ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-zinc-950" />
                  <span>Test In-Flight Patch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Healed Outcome & Contract Check */}
        <div className="p-4 flex flex-col gap-3 font-mono text-xs bg-zinc-950/40">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">
              Healed Payload & Schema Verification
            </span>
            {testResult && (
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(testResult.healedPayload, null, 2))
                }
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded transition"
              >
                {copiedHealed ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copy</span>
              </button>
            )}
          </div>

          {testResult ? (
            <div className="flex flex-col gap-3">
              {/* Outcome Badge */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  testResult.passedSchema
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.passedSchema ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-none" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-400 flex-none" />
                  )}
                  <span className="font-semibold">
                    {testResult.passedSchema
                      ? "Contract Verified: 200 OK Downstream Delivery"
                      : "Schema Validation Failed: Missing required properties"}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                  {testResult.patchCount} Patch(es) applied
                </span>
              </div>

              {/* Healed JSON */}
              <div className="relative rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 overflow-x-auto max-h-72">
                <pre className="text-emerald-300 whitespace-pre selection:bg-emerald-500/30">
                  {JSON.stringify(testResult.healedPayload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500">
              <Code2 className="h-8 w-8 text-zinc-700 mb-2" />
              <div className="text-zinc-300 font-semibold text-xs">
                Sandbox Awaiting Execution
              </div>
              <div className="text-[11px] text-zinc-500 max-w-xs mt-1">
                Click &quot;Test In-Flight Patch&quot; to apply active RFC 6902 mutation rules and check validation against downstream contracts.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
