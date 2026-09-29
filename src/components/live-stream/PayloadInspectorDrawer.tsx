"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  FileCode2,
  ListOrdered,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { WebhookEventView } from "@/lib/events-service";

interface PayloadInspectorDrawerProps {
  event: WebhookEventView | null;
  onClose: () => void;
  endpointId: string;
}

export function PayloadInspectorDrawer({
  event,
  onClose,
  endpointId,
}: PayloadInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<"payload" | "headers" | "delivery">("payload");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const payloadString = JSON.stringify(event.payload, null, 2);
  const payloadBytes = new Blob([payloadString]).size;
  const payloadSizeKb = (payloadBytes / 1024).toFixed(2);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Drawer Top Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-zinc-900/40">
            <div className="flex items-center gap-3">
              {event.status === "DELIVERED" ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{event.responseStatus || 200} DELIVERED</span>
                </span>
              ) : event.status === "FAILED_DLQ" ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-xs text-rose-400 font-medium">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  <span>{event.responseStatus || 422} FAILED DLQ</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400 font-medium">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>RETRYING ({event.attempts}/{event.maxAttempts})</span>
                </span>
              )}

              <span className="text-sm font-semibold text-white font-mono">
                {event.eventType}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500">ESC to close</span>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Event Metadata Strip */}
          <div className="px-6 py-3 border-b border-zinc-800/60 bg-zinc-900/20 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-3 text-zinc-400">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Event ID</span>
              <span className="text-zinc-200 select-all">{event.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Idempotency Key</span>
              <span className="text-zinc-200 truncate block select-all" title={event.idempotencyKey}>
                {event.idempotencyKey}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Timestamp</span>
              <span className="text-zinc-200">{new Date(event.createdAt).toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Latency</span>
              <span className="text-zinc-200">{event.latencyMs}ms</span>
            </div>
          </div>

          {/* DLQ Urgent Recovery Banner (if failed) */}
          {event.status === "FAILED_DLQ" && (
            <div className="mx-6 mt-4 p-4 rounded-lg border border-rose-500/30 bg-rose-500/10 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-rose-300 font-medium text-xs">
                  <ShieldAlert className="h-4 w-4 text-rose-400 flex-none" />
                  <span>Poisoned Webhook Routed to Dead-Letter Queue (DLQ)</span>
                </div>
                <Link
                  href={`/endpoints/${endpointId}/dlq/${event.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
                >
                  <span>Launch AI Triage Engine</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="text-xs font-mono text-rose-200/80 bg-rose-950/40 p-2 rounded border border-rose-900/40">
                {event.lastError || "HTTP 422: Downstream schema validation failed on target service."}
              </p>
            </div>
          )}

          {/* Drawer Navigation Tabs */}
          <div className="flex items-center gap-4 px-6 pt-4 border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("payload")}
              className={`flex items-center gap-1.5 py-2 text-xs font-mono border-b-2 transition ${
                activeTab === "payload"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>Payload ({payloadSizeKb} KB)</span>
            </button>

            <button
              onClick={() => setActiveTab("headers")}
              className={`flex items-center gap-1.5 py-2 text-xs font-mono border-b-2 transition ${
                activeTab === "headers"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Headers ({Object.keys(event.headers || {}).length})</span>
            </button>

            <button
              onClick={() => setActiveTab("delivery")}
              className={`flex items-center gap-1.5 py-2 text-xs font-mono border-b-2 transition ${
                activeTab === "delivery"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Delivery & Retries</span>
            </button>
          </div>

          {/* Drawer Body Contents */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs">
            {activeTab === "payload" && (
              <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-3">
                  <span className="text-[11px] text-zinc-500 uppercase">
                    Raw JSON Body
                  </span>
                  <button
                    onClick={() => copyToClipboard(payloadString, setCopiedPayload)}
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
                  >
                    {copiedPayload ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedPayload ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="text-zinc-200 overflow-x-auto selection:bg-emerald-500/30 whitespace-pre">
                  {payloadString}
                </pre>
              </div>
            )}

            {activeTab === "headers" && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-3">
                  <span className="text-[11px] text-zinc-500 uppercase">
                    HTTP Request Headers
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(event.headers, null, 2),
                        setCopiedHeaders
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
                  >
                    {copiedHeaders ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>

                <div className="divide-y divide-zinc-800/50">
                  {Object.entries(event.headers || {}).map(([key, val]) => (
                    <div key={key} className="py-2 flex items-start gap-4">
                      <span className="text-emerald-400/90 flex-none w-44 font-semibold break-all">
                        {key}
                      </span>
                      <span className="text-zinc-300 break-all select-all flex-1">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-4">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">
                    Downstream Delivery Attempt Log
                  </h4>

                  <div className="space-y-3 mt-3">
                    <div className="flex items-start gap-3 text-xs">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        Attempt 1
                      </span>
                      <div className="flex-1">
                        <div className="text-zinc-300">Dispatched to forwarding target</div>
                        <div className="text-zinc-500 text-[11px]">
                          Latency: {event.latencyMs}ms — Response Code: {event.responseStatus || 200}
                        </div>
                      </div>
                    </div>

                    {event.status === "RETRYING" && (
                      <div className="flex items-start gap-3 text-xs">
                        <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.5 text-[10px]">
                          Attempt 2
                        </span>
                        <div className="flex-1">
                          <div className="text-amber-300">Queued for exponential backoff (5s delay)</div>
                          <div className="text-zinc-500 text-[11px]">
                            Worker thread pool awaiting downstream health check.
                          </div>
                        </div>
                      </div>
                    )}

                    {event.status === "FAILED_DLQ" && (
                      <div className="flex items-start gap-3 text-xs">
                        <span className="rounded bg-rose-500/20 text-rose-300 px-1.5 py-0.5 text-[10px]">
                          Final
                        </span>
                        <div className="flex-1">
                          <div className="text-rose-400 font-semibold">Exhausted retries — Poisoned payload quarantined</div>
                          <div className="text-zinc-400 text-[11px] mt-1">
                            {event.lastError}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
