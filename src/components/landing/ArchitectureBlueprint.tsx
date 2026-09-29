"use client";

import { useState } from "react";
import {
  Zap,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export function ArchitectureBlueprint() {
  const [activeTab, setActiveTab] = useState<"write" | "worker" | "dlq">("write");

  return (
    <section id="architecture" className="py-16 sm:py-20 border-b border-white/[0.06] bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Architectural Blueprint
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Decoupling the high-availability synchronous write path from the asynchronous retry worker and AI remediation pipeline.
          </p>
        </div>

        {/* Path Selector Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-mono transition ${
              activeTab === "write"
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300 shadow-sm"
                : "border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>01. Ingestion Write Path (p99 &lt; 25ms)</span>
          </button>

          <button
            onClick={() => setActiveTab("worker")}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-mono transition ${
              activeTab === "worker"
                ? "border-blue-500/40 bg-blue-950/20 text-blue-300 shadow-sm"
                : "border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
            <span>02. Asynchronous Workers (SKIP LOCKED)</span>
          </button>

          <button
            onClick={() => setActiveTab("dlq")}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-mono transition ${
              activeTab === "dlq"
                ? "border-purple-500/40 bg-purple-950/20 text-purple-300 shadow-sm"
                : "border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>03. Self-Healing DLQ &amp; AI Triage</span>
          </button>
        </div>

        {/* Blueprint Visual Box */}
        <div className="mt-6 rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4 sm:p-6 bg-grid-pattern">
          {activeTab === "write" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/[0.06]">
                <span className="font-mono text-emerald-400">PATH A: High-Availability Edge Ingestion</span>
                <span className="font-mono text-zinc-500">Target Budget: &lt; 25ms</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                    <span>STEP 1</span>
                    <span>&lt; 2ms</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-zinc-200">Edge Gateway Ingress</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Non-blocking Next.js route parses raw stream bytes (`req.text()`) to preserve uncorrupted payload bytes.
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                    <span>STEP 2</span>
                    <span>&lt; 5ms</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-zinc-200">HMAC-SHA256 Auth</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Native Node.js crypto calculates signature against endpoint secret with constant-time equality check.
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                    <span>STEP 3</span>
                    <span>&lt; 3ms</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-zinc-200">Token Bucket Defense</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    In-memory Redis token bucket enforces multi-tenant limits: Community (10 req/s) vs. Pro (100 req/s).
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-500/30 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px]">
                    <span>STEP 4</span>
                    <span>&lt; 10ms</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-emerald-300">Transactional Append</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Drizzle ORM writes payload to PostgreSQL `webhook_events` with unique constraint on `(endpoint_id, idempotency_key)`.
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-white/[0.06] bg-zinc-950/70 p-3 text-xs text-zinc-400 font-mono">
                <span className="text-emerald-400">Result:</span> Immediate HTTP 202 Accepted returned to provider. Delivery guaranteed before worker execution.
              </div>
            </div>
          )}

          {activeTab === "worker" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/[0.06]">
                <span className="font-mono text-blue-400">PATH B: Competing Consumer Workers</span>
                <span className="font-mono text-zinc-500">Concurrency: Row-Level Locking</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                    <span>LOCKING</span>
                    <span>SKIP LOCKED</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-zinc-200">Zero Race Conditions</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Workers poll PostgreSQL using `SELECT ... FOR UPDATE SKIP LOCKED` ensuring horizontally scaled nodes never double-process an event.
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                    <span>DISPATCH</span>
                    <span>1s, 5s, 25s</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-zinc-200">Exponential Backoff</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Transient 5xx downstream errors schedule automatic retries with exponential backoff and jitter up to 3 max attempts.
                  </p>
                </div>

                <div className="rounded-lg border border-blue-500/30 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-blue-400 font-mono text-[10px]">
                    <span>SUCCESS</span>
                    <span>HTTP 200</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-blue-300">DELIVERED State</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Upon HTTP 2xx confirmation, event state transitions to `DELIVERED`, recording execution timestamp and response headers.
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-white/[0.06] bg-zinc-950/70 p-3 text-xs text-zinc-400 font-mono">
                <span className="text-blue-400">Stream Telemetry:</span> Every worker attempt broadcasts status and latency over Server-Sent Events (SSE) to the dashboard.
              </div>
            </div>
          )}

          {activeTab === "dlq" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/[0.06]">
                <span className="font-mono text-purple-400">PATH C: Self-Healing Dead-Letter Queue</span>
                <span className="font-mono text-zinc-500">Format: Deterministic RFC 6902</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-rose-400 font-mono text-[10px]">
                    <span>TRIGGER</span>
                    <span>4xx DRIFT</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-rose-300">Poisoned Quarantine</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Breaking schema changes fail downstream contract. State transitions to `FAILED_DLQ` with last error preserved.
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-purple-400 font-mono text-[10px]">
                    <span>ANALYSIS</span>
                    <span>ZOD CONTRACT</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-purple-300">AST Schema Diff</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Target schema contract is compared against the failing payload to pinpoint exact missing or renamed paths.
                  </p>
                </div>

                <div className="rounded-lg border border-purple-500/30 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-purple-400 font-mono text-[10px]">
                    <span>AI AGENT</span>
                    <span>STRICT JSON</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-purple-300">RFC 6902 Patch</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Isolated triage model outputs strict array of operations (`add`, `replace`, `remove`, `move`).
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-500/30 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px]">
                    <span>RESOLUTION</span>
                    <span>1-CLICK</span>
                  </div>
                  <div className="mt-2 font-medium text-xs text-emerald-300">Replay &amp; Rule Save</div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Operator reviews visual diff, hits &quot;Approve &amp; Replay&quot;, and optionally saves as permanent mutation rule.
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-purple-500/20 bg-purple-950/20 p-3 text-xs text-purple-300 font-mono">
                <span className="text-purple-400">Safety Guarantee:</span> Zero hallucinated payloads. Patches must pass `fast-json-patch` validation before replay.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
