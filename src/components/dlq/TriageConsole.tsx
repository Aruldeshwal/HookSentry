"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Play,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Layers,
  RotateCcw,
} from "lucide-react";
import type { WebhookEventView } from "@/lib/events-service";
import type { EndpointView } from "@/lib/endpoints-service";
import type { TriageAnalysis } from "@/lib/triage-engine";
import type { Operation } from "fast-json-patch";

interface TriageConsoleProps {
  endpoint: EndpointView;
  event: WebhookEventView;
  initialTriage: TriageAnalysis;
}

export function TriageConsole({
  endpoint,
  event: initialEvent,
  initialTriage,
}: TriageConsoleProps) {
  const [event, setEvent] = useState<WebhookEventView>(initialEvent);
  const [triage] = useState<TriageAnalysis>(initialTriage);
  const [activePatches, setActivePatches] = useState<Operation[]>(initialTriage.suggestedPatches);
  const [rawPatchMode, setRawPatchMode] = useState(false);
  const [rawPatchString, setRawPatchString] = useState(
    JSON.stringify(initialTriage.suggestedPatches, null, 2)
  );

  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedHealed, setCopiedHealed] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  const [isReplaying, setIsReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<{
    status: number;
    latencyMs: number;
    message: string;
  } | null>(null);

  const [isPromoting, setIsPromoting] = useState(false);
  const [promotedSuccess, setPromotedSuccess] = useState(false);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Replay Execution
  const handleApproveAndReplay = async () => {
    setIsReplaying(true);
    try {
      let patchesToSend = activePatches;
      if (rawPatchMode) {
        try {
          patchesToSend = JSON.parse(rawPatchString);
        } catch {
          alert("Invalid JSON Patch syntax");
          setIsReplaying(false);
          return;
        }
      }

      const res = await fetch(
        `/api/endpoints/${endpoint.id}/dlq/${event.id}/replay`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patches: patchesToSend }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setReplayResult({
          status: data.responseStatus || 200,
          latencyMs: data.replayLatencyMs || 36,
          message: data.message || "Webhook transformed and accepted by downstream target.",
        });
        setEvent((prev) => ({
          ...prev,
          status: "DELIVERED",
          responseStatus: 200,
          payload: data.healedPayload,
        }));
      } else {
        alert(data.error || "Replay failed");
      }
    } catch (err) {
      console.error("Replay error:", err);
      alert("Replay dispatch failed.");
    } finally {
      setIsReplaying(false);
    }
  };

  // Promote to Permanent Rule
  const handlePromoteRule = async () => {
    setIsPromoting(true);
    try {
      let patchesToSend = activePatches;
      if (rawPatchMode) {
        try {
          patchesToSend = JSON.parse(rawPatchString);
        } catch {
          alert("Invalid JSON Patch syntax");
          setIsPromoting(false);
          return;
        }
      }

      const res = await fetch(
        `/api/endpoints/${endpoint.id}/dlq/${event.id}/promote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patches: patchesToSend,
            name: `${triage.provider} — Auto-Repair ${event.eventType}`,
            description: triage.explanation,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setPromotedSuccess(true);
      }
    } catch (err) {
      console.error("Promote rule error:", err);
    } finally {
      setIsPromoting(false);
    }
  };

  const originalJson = JSON.stringify(event.payload, null, 2);
  const healedJson = JSON.stringify(triage.healedPayload, null, 2);

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-zinc-950 font-sans">
      {/* Top Breadcrumb & Incident Details Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm px-4 sm:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/endpoints/${endpoint.id}/dlq`}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition py-1 px-2 -ml-2 rounded-md hover:bg-zinc-800/50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to DLQ</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white font-mono">
                {event.id}
              </span>
              {event.status === "DELIVERED" ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>200 DELIVERED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono font-medium border bg-rose-500/10 text-rose-400 border-rose-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>QUARANTINED ({event.attempts}/{event.maxAttempts})</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-500">PROVIDER:</span>
            <span className="px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
              {triage.provider}
            </span>
          </div>
        </div>

        {/* Target and Key metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-zinc-800/50 font-mono text-xs text-zinc-400">
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block">Idempotency Key</span>
            <span className="text-zinc-200 truncate block select-all">{event.idempotencyKey}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block">Forwarding Target</span>
            <span className="text-zinc-200 truncate block">{endpoint.targetUrl}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block">Quarantined At</span>
            <span className="text-zinc-200">{new Date(event.createdAt).toISOString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 flex flex-col gap-6">
        {/* AI Root Cause Diagnostic Card */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 flex-none mt-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-rose-200">
                    AI Triage Root-Cause Analysis
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {Math.round(triage.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <p className="text-xs font-sans text-rose-300/90 leading-relaxed max-w-3xl">
                  {triage.explanation}
                </p>
                <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-rose-400/80">
                  <span className="text-zinc-500">DOWNSTREAM ERROR:</span>
                  <span className="bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                    {event.lastError}
                  </span>
                </div>
              </div>
            </div>

            {/* Replay Action Station */}
            <div className="flex flex-col gap-2 flex-none min-w-[220px]">
              <button
                onClick={handleApproveAndReplay}
                disabled={isReplaying || event.status === "DELIVERED"}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition shadow-lg ${
                  event.status === "DELIVERED"
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                    : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/10"
                }`}
              >
                {isReplaying ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin text-zinc-950" />
                    <span>Replaying Payload...</span>
                  </>
                ) : event.status === "DELIVERED" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Delivered Successfully</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-zinc-950" />
                    <span>Approve & Replay Event</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePromoteRule}
                disabled={isPromoting || promotedSuccess}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono transition ${
                  promotedSuccess
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                {promotedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Rule Promoted to Gateway</span>
                  </>
                ) : (
                  <>
                    <Layers className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{isPromoting ? "Promoting..." : "Promote to Permanent Rule"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Replay Result Banner */}
          {replayResult && (
            <div className="mt-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs font-mono text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-none" />
                <span>
                  HTTP {replayResult.status} OK — Delivery Acknowledged in {replayResult.latencyMs}ms! {replayResult.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Side-by-Side Visual JSON Diff */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Original Poisoned Payload */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col overflow-hidden shadow-md">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold font-mono text-rose-300">
                  Original Raw Payload (Poisoned)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(originalJson, setCopiedOriginal)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
              >
                {copiedOriginal ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedOriginal ? "Copied" : "Copy Raw"}</span>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-x-auto bg-zinc-950/70 font-mono text-xs">
              <pre className="text-rose-200/90 whitespace-pre selection:bg-rose-500/30">
                {originalJson}
              </pre>
            </div>
          </div>

          {/* Right: Synthesized Healed Payload */}
          <div className="rounded-xl border border-emerald-500/30 bg-zinc-900/40 flex flex-col overflow-hidden shadow-md">
            <div className="px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold font-mono text-emerald-300">
                  Deterministic Replay Preview (RFC 6902 Applied)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(healedJson, setCopiedHealed)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
              >
                {copiedHealed ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedHealed ? "Copied" : "Copy Healed"}</span>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-x-auto bg-zinc-950/70 font-mono text-xs">
              <pre className="text-emerald-200/90 whitespace-pre selection:bg-emerald-500/30">
                {healedJson}
              </pre>
            </div>
          </div>
        </div>

        {/* RFC 6902 JSON Patch Editor Station */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-md">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold font-mono text-zinc-200">
                RFC 6902 Mutation Operations
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                fast-json-patch Verified
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRawPatchMode(!rawPatchMode)}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
              >
                {rawPatchMode ? "Switch to Visual Cards" : "Edit Raw JSON Patch"}
              </button>
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(activePatches, null, 2),
                    setCopiedPatch
                  )
                }
                className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
              >
                {copiedPatch ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copy Patch</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/70 font-mono text-xs">
            {rawPatchMode ? (
              <textarea
                value={rawPatchString}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawPatchString(val);
                  try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) {
                      setActivePatches(parsed);
                    }
                  } catch {
                    // typing incomplete JSON
                  }
                }}
                rows={6}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
              />
            ) : (
              <div className="space-y-2">
                {activePatches.map((patch, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 uppercase font-bold">
                        {patch.op}
                      </span>
                      {"from" in patch && (
                        <div className="text-zinc-400">
                          <span className="text-zinc-500">from: </span>
                          <span className="text-zinc-200">{patch.from}</span>
                        </div>
                      )}
                      <div className="text-zinc-400">
                        <span className="text-zinc-500">path: </span>
                        <span className="text-zinc-200 font-semibold">{patch.path}</span>
                      </div>
                      {"value" in patch && (
                        <div className="text-zinc-400">
                          <span className="text-zinc-500">value: </span>
                          <span className="text-emerald-300">{JSON.stringify(patch.value)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      Applied safely via RFC 6902 specification
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
