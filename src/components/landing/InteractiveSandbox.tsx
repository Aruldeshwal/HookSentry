"use client";

import { useState } from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type PresetType = "200_ok" | "422_drift" | "429_quota";

interface LogEntry {
  id: string;
  time: string;
  type: "info" | "success" | "warn" | "error" | "ai";
  message: string;
  code?: string;
}

const PRESET_PAYLOADS: Record<PresetType, { title: string; json: string; desc: string }> = {
  "200_ok": {
    title: "200 OK (Standard Ingestion)",
    desc: "Valid webhook schema adhering to downstream consumer contracts.",
    json: JSON.stringify(
      {
        event: "order.created",
        order_id: "ord_live_8831",
        amount_cents: 14900,
        currency: "usd",
        customer_id: "cus_90114a",
        items_count: 2,
      },
      null,
      2
    ),
  },
  "422_drift": {
    title: "422 Drift (Breaking Upstream Change)",
    desc: "Upstream renamed 'customer_id' to nested 'user.account_id' causing downstream 422 failure.",
    json: JSON.stringify(
      {
        event: "order.created",
        order_id: "ord_live_8832",
        amount_cents: 14900,
        currency: "USD",
        user: {
          account_id: "cus_90114a",
        },
        items_count: 2,
      },
      null,
      2
    ),
  },
  "429_quota": {
    title: "429 Rate Limit (Token Bucket Burst)",
    desc: "Burst ingestion traffic exceeding the Community Tier quota (10 req/s).",
    json: JSON.stringify(
      {
        event: "device.telemetry_burst",
        batch_size: 150,
        rate_window: "1s",
        client_tier: "COMMUNITY",
      },
      null,
      2
    ),
  },
};

export function InteractiveSandbox() {
  const [activePreset, setActivePreset] = useState<PresetType>("200_ok");
  const [payloadText, setPayloadText] = useState(PRESET_PAYLOADS["200_ok"].json);
  const [activeTab, setActiveTab] = useState<"stream" | "headers" | "patch">("stream");
  const [isFiring, setIsFiring] = useState(false);
  const [driftDetected, setDriftDetected] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init-1",
      time: "20:56:00.010",
      type: "info",
      message: "HookSentry Ingestion Gateway online at edge route: POST /api/v1/ingest",
    },
    {
      id: "init-2",
      time: "20:56:00.014",
      type: "info",
      message: "HMAC-SHA256 crypto verifier active (target: sha256=d3b07384...)",
    },
    {
      id: "init-3",
      time: "20:56:00.018",
      type: "info",
      message: "Ready for live payload simulation. Select a preset on the left.",
    },
  ]);

  const handleSelectPreset = (preset: PresetType) => {
    setActivePreset(preset);
    setPayloadText(PRESET_PAYLOADS[preset].json);
    setDriftDetected(false);
    setPatchApplied(false);
  };

  const getTimeString = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d
      .getMilliseconds()
      .toString()
      .padStart(3, "0")}`;
  };

  const handleFireWebhook = () => {
    setIsFiring(true);
    setPatchApplied(false);

    const now = getTimeString();
    const idempKey = `idemp_${Math.random().toString(36).substring(2, 9)}`;

    if (activePreset === "200_ok") {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-1`,
          time: now,
          type: "info",
          message: `POST /api/v1/ingest [Idempotency: ${idempKey}]`,
        },
        {
          id: `log-${Date.now()}-2`,
          time: now,
          type: "info",
          message: "HMAC-SHA256 signature verified in 1.8ms",
        },
        {
          id: `log-${Date.now()}-3`,
          time: now,
          type: "success",
          message: "State transition: PENDING -> DELIVERED (HTTP 200 OK in 14.2ms)",
        },
        ...prev,
      ]);
      setDriftDetected(false);
    } else if (activePreset === "422_drift") {
      setDriftDetected(true);
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-1`,
          time: now,
          type: "info",
          message: `POST /api/v1/ingest [Idempotency: ${idempKey}]`,
        },
        {
          id: `log-${Date.now()}-2`,
          time: now,
          type: "warn",
          message: "Worker dispatch attempt 1/3 -> Downstream returned HTTP 422 Unprocessable Entity",
        },
        {
          id: `log-${Date.now()}-3`,
          time: now,
          type: "error",
          message: "Zod Schema Drift: Required 'customer_id' missing; unexpected nested 'user.account_id'",
        },
        {
          id: `log-${Date.now()}-4`,
          time: now,
          type: "error",
          message: "State transition: RETRYING -> FAILED_DLQ (Poisoned Event Quarantined)",
        },
        {
          id: `log-${Date.now()}-5`,
          time: now,
          type: "ai",
          message: "AI Triage Engine generated deterministic RFC 6902 mutation patch (Click 'Approve & Replay' below)",
        },
        ...prev,
      ]);
    } else if (activePreset === "429_quota") {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-1`,
          time: now,
          type: "info",
          message: `Burst Ingest: 150 requests sent inside 1000ms window`,
        },
        {
          id: `log-${Date.now()}-2`,
          time: now,
          type: "error",
          message: "RateLimit Exceeded: 10/10 req/s tokens depleted on COMMUNITY tier",
        },
        {
          id: `log-${Date.now()}-3`,
          time: now,
          type: "warn",
          message: "HTTP 429 Too Many Requests — Retry-After: 1s. Zero event loss: queued to local edge cache buffer.",
        },
        ...prev,
      ]);
      setDriftDetected(false);
    }

    setTimeout(() => {
      setIsFiring(false);
    }, 400);
  };

  const handleApproveReplay = () => {
    const now = getTimeString();
    setPatchApplied(true);
    setLogs((prev) => [
      {
        id: `replay-${Date.now()}-1`,
        time: now,
        type: "ai",
        message: "Applying RFC 6902 Patch: move '/user/account_id' to '/customer_id'",
      },
      {
        id: `replay-${Date.now()}-2`,
        time: now,
        type: "info",
        message: "Replaying transformed event to downstream consumer target...",
      },
      {
        id: `replay-${Date.now()}-3`,
        time: now,
        type: "success",
        message: "Downstream returned HTTP 200 OK — State transition: FAILED_DLQ -> DELIVERED (Recovered without code changes!)",
      },
      ...prev,
    ]);
  };

  const clearLogs = () => {
    setLogs([
      {
        id: "cleared-1",
        time: getTimeString(),
        type: "info",
        message: "Terminal buffer cleared. Ready for next simulation.",
      },
    ]);
    setDriftDetected(false);
    setPatchApplied(false);
  };

  return (
    <section id="sandbox" className="py-16 sm:py-20 border-b border-white/[0.06] bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Gateway Simulator
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Interactive Ingest Sandbox &amp; Self-Healing DLQ
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Trigger live simulated webhooks, watch cryptographic verification, and test 1-click AI schema drift triage.
            </p>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/60 p-1">
            <button
              onClick={() => handleSelectPreset("200_ok")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                activePreset === "200_ok"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              200 OK Standard
            </button>
            <button
              onClick={() => handleSelectPreset("422_drift")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                activePreset === "422_drift"
                  ? "bg-rose-950/50 text-rose-300 border border-rose-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              422 Schema Drift
            </button>
            <button
              onClick={() => handleSelectPreset("429_quota")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                activePreset === "429_quota"
                  ? "bg-amber-950/50 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              429 Rate Burst
            </button>
          </div>
        </div>

        {/* Dual-Pane Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 p-2 sm:p-3">
          {/* Left Pane: Ingest Trigger (5 cols) */}
          <div className="lg:col-span-5 flex flex-col rounded-lg border border-white/[0.06] bg-zinc-950 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-300">
                  {PRESET_PAYLOADS[activePreset].title}
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">JSON Payload</span>
            </div>

            <p className="mt-2 text-xs text-zinc-400 min-h-[32px]">
              {PRESET_PAYLOADS[activePreset].desc}
            </p>

            {/* Editable JSON Area */}
            <div className="mt-3 flex-1">
              <label className="sr-only">Payload JSON</label>
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full h-64 rounded-md border border-zinc-800 bg-zinc-900/80 p-3 font-mono text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Cryptographic Signature & Ingestion CTA */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>HMAC Header:</span>
                <span className="truncate max-w-[200px] text-zinc-400">
                  sha256=9f83...bc41
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFireWebhook}
                  disabled={isFiring}
                  className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 text-xs font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isFiring ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                  <span>Fire Webhook Trigger</span>
                </button>

                <button
                  onClick={() => setPayloadText(PRESET_PAYLOADS[activePreset].json)}
                  title="Reset to default payload"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Pane: Real-Time Streaming Terminal Feed (7 cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-lg border border-white/[0.06] bg-zinc-950 p-4">
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="ml-2 font-mono text-xs text-zinc-400">
                  events.stream.sse — v1
                </span>
              </div>

              {/* Terminal View Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex rounded border border-zinc-800 bg-zinc-900/60 p-0.5 text-[11px] font-mono">
                  <button
                    onClick={() => setActiveTab("stream")}
                    className={`px-2 py-0.5 rounded ${
                      activeTab === "stream"
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => setActiveTab("headers")}
                    className={`px-2 py-0.5 rounded ${
                      activeTab === "headers"
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Headers
                  </button>
                  {driftDetected && (
                    <button
                      onClick={() => setActiveTab("patch")}
                      className={`px-2 py-0.5 rounded ${
                        activeTab === "patch"
                          ? "bg-purple-900/60 text-purple-300 border border-purple-500/40"
                          : "text-purple-400 hover:text-purple-300"
                      }`}
                    >
                      RFC 6902 Patch
                    </button>
                  )}
                </div>

                <button
                  onClick={clearLogs}
                  className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="mt-3 flex-1 h-72 overflow-y-auto font-mono text-xs space-y-2 p-1">
              {activeTab === "stream" && (
                <div className="space-y-1.5">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-tight">
                      <span className="text-zinc-600 select-none text-[11px]">
                        [{log.time}]
                      </span>
                      {log.type === "success" && (
                        <span className="text-emerald-400">✓ {log.message}</span>
                      )}
                      {log.type === "error" && (
                        <span className="text-rose-400">✗ {log.message}</span>
                      )}
                      {log.type === "warn" && (
                        <span className="text-amber-400">⚠ {log.message}</span>
                      )}
                      {log.type === "ai" && (
                        <span className="text-purple-300 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 inline text-purple-400" />
                          {log.message}
                        </span>
                      )}
                      {log.type === "info" && (
                        <span className="text-zinc-400">{log.message}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "headers" && (
                <div className="space-y-1 text-zinc-300 text-xs">
                  <div className="text-zinc-500"># Inbound Gateway Signature Verification</div>
                  <div><span className="text-zinc-500">Host:</span> api.hooksentry.io</div>
                  <div><span className="text-zinc-500">X-HookSentry-Signature:</span> sha256=9f83...bc41 (HMAC Valid)</div>
                  <div><span className="text-zinc-500">X-HookSentry-Idempotency:</span> idemp_9981a_b8f</div>
                  <div><span className="text-zinc-500">X-HookSentry-Tier:</span> COMMUNITY (Quota: 10 req/s)</div>
                  <div><span className="text-zinc-500">Content-Type:</span> application/json</div>
                  <div><span className="text-zinc-500">Content-Length:</span> 164</div>
                </div>
              )}

              {activeTab === "patch" && (
                <div className="space-y-2">
                  <div className="text-[11px] text-purple-300 font-mono">
                    {"// Deterministic RFC 6902 Mutation Generated via Zod Spec"}
                  </div>
                  <pre className="rounded bg-zinc-900/90 p-2.5 text-xs text-purple-200 border border-purple-500/20 overflow-x-auto">
{`[
  {
    "op": "add",
    "path": "/customer_id",
    "value": "cus_90114a"
  },
  {
    "op": "remove",
    "path": "/user"
  }
]`}
                  </pre>
                  <div className="text-[11px] text-zinc-400">
                    Resulting payload satisfies consumer schema: <span className="text-emerald-400">Zod(OrderSchema).parse()</span> passes.
                  </div>
                </div>
              )}
            </div>

            {/* DLQ Recovery Banner Action */}
            {driftDetected && (
              <div className="mt-3 rounded-md border border-purple-500/30 bg-purple-950/20 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-medium text-purple-200">
                      AI Triage Ready:
                    </span>{" "}
                    <span className="text-zinc-400">
                      RFC 6902 patch generated to fix schema drift.
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleApproveReplay}
                  disabled={patchApplied}
                  className="inline-flex items-center gap-1.5 rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-500 disabled:opacity-50 flex-shrink-0"
                >
                  {patchApplied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Replayed Successfully!</span>
                    </>
                  ) : (
                    <>
                      <span>Approve Mutation &amp; Replay</span>
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
