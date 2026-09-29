"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
  Radio,
  FileCode2,
  Terminal,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import type { EndpointView } from "@/lib/endpoints-service";

interface EndpointHeaderProps {
  endpoint: EndpointView;
  activeTab?: "stream" | "dlq" | "schemas";
}

export function EndpointHeader({
  endpoint,
  activeTab = "stream",
}: EndpointHeaderProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showCurlModal, setShowCurlModal] = useState(false);

  const ingestUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/v1/ingest/${endpoint.id}`
    : `https://hooksentry.io/api/v1/ingest/${endpoint.id}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleCurl = `curl -X POST "${ingestUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Idempotency-Key: idemp_sample_88192a01" \\
  -H "X-HookSentry-Signature: <computed-hmac-sha256>" \\
  -d '{"event": "payment.succeeded", "amount": 9900, "customer_id": "cus_123"}'`;

  return (
    <div className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm px-4 sm:px-8 py-5">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/endpoints"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition py-1 px-2 -ml-2 rounded-md hover:bg-zinc-800/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Fleet</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2.5">
            {endpoint.name}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                endpoint.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : endpoint.status === "DEGRADED"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  endpoint.status === "ACTIVE"
                    ? "bg-emerald-400"
                    : endpoint.status === "DEGRADED"
                    ? "bg-rose-400 animate-pulse"
                    : "bg-amber-400"
                }`}
              />
              {endpoint.status}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-zinc-700/60 text-zinc-400 bg-zinc-900/60">
              {endpoint.tier} TIER ({endpoint.rateLimit} req/s)
            </span>
          </h1>
        </div>

        {/* Quick cURL Generator CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCurlModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 transition"
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>cURL Generator</span>
          </button>
        </div>
      </div>

      {/* Gateway Ingest Credentials Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1 pb-4">
        {/* Ingest URL */}
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Ingestion Gateway URL
          </span>
          <div className="flex items-center justify-between gap-2 font-mono text-xs text-zinc-200">
            <span className="truncate selection:bg-emerald-500/30">
              {ingestUrl}
            </span>
            <button
              onClick={() => copyToClipboard(ingestUrl, setCopiedUrl)}
              className="flex-none p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Copy Ingest URL"
            >
              {copiedUrl ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* HMAC Secret */}
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            HMAC-SHA256 Signing Secret
          </span>
          <div className="flex items-center justify-between gap-2 font-mono text-xs text-zinc-200">
            <span className="truncate">
              {showSecret
                ? endpoint.secret
                : endpoint.secret.slice(0, 6) + "••••••••••••••••"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                title={showSecret ? "Hide Secret" : "Reveal Secret"}
              >
                {showSecret ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(endpoint.secret, setCopiedSecret)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                title="Copy Secret"
              >
                {copiedSecret ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Target Destination */}
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Forwarding Target
          </span>
          <div className="flex items-center justify-between gap-2 font-mono text-xs text-zinc-200">
            <span className="truncate text-zinc-300">{endpoint.targetUrl}</span>
            <a
              href={endpoint.targetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-none p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Open target URL"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-6 pt-1 border-t border-zinc-800/50">
        <Link
          href={`/endpoints/${endpoint.id}`}
          className={`flex items-center gap-2 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === "stream"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Live Ingest Stream</span>
        </Link>

        <Link
          href={`/endpoints/${endpoint.id}/dlq`}
          className={`flex items-center gap-2 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === "dlq"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>Dead-Letter Queue & Triage</span>
          {endpoint.dlqCount > 0 && (
            <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-mono text-rose-300">
              {endpoint.dlqCount}
            </span>
          )}
        </Link>

        <Link
          href={`/endpoints/${endpoint.id}/schemas`}
          className={`flex items-center gap-2 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === "schemas"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5 text-zinc-400" />
          <span>Contracts & Mutation Rules</span>
        </Link>
      </div>

      {/* cURL Modal */}
      {showCurlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Sample Webhook Ingestion cURL
              </h3>
              <button
                onClick={() => setShowCurlModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-100 p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-3 mb-2">
              Send a test webhook to this endpoint gateway. The request will be rate-limited, cryptographically verified, and routed over Server-Sent Events in real time.
            </p>
            <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-3">
              <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
                {sampleCurl}
              </pre>
              <button
                onClick={() => copyToClipboard(sampleCurl, setCopiedUrl)}
                className="absolute top-2 right-2 rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-[11px] font-mono text-zinc-300 flex items-center gap-1"
              >
                {copiedUrl ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowCurlModal(false)}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
