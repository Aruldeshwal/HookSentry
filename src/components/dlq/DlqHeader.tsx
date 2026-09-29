"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  FileCode2,
} from "lucide-react";
import type { EndpointView } from "@/lib/endpoints-service";

interface DlqHeaderProps {
  endpoint: EndpointView;
  dlqCount: number;
}

export function DlqHeader({ endpoint, dlqCount }: DlqHeaderProps) {
  return (
    <div className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm px-4 sm:px-8 py-5">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/endpoints/${endpoint.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition py-1 px-2 -ml-2 rounded-md hover:bg-zinc-800/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Live Stream</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2.5">
            <span>Dead-Letter Queue (DLQ)</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-mono font-medium border bg-rose-500/10 text-rose-400 border-rose-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>{dlqCount} QUARANTINED</span>
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>AI Triage Engine Active</span>
          </div>
        </div>
      </div>

      {/* DLQ Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 pb-4">
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase text-[10px] font-mono tracking-wider">Quarantine Pool</span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {dlqCount}
          </div>
          <span className="text-[11px] text-zinc-500">
            Webhooks exhausted 3 retry attempts
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase text-[10px] font-mono tracking-wider">Target Endpoint</span>
            <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div className="text-xs font-mono text-zinc-200 truncate mt-1">
            {endpoint.targetUrl}
          </div>
          <span className="text-[11px] text-zinc-500">
            Rate limited at {endpoint.rateLimit} req/s ({endpoint.tier})
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase text-[10px] font-mono tracking-wider">Recovery Mode</span>
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-0.5">
            RFC 6902 Patch Replay
          </div>
          <span className="text-[11px] text-zinc-500">
            Mathematical zero-loss schema healing
          </span>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-6 pt-1 border-t border-zinc-800/50">
        <Link
          href={`/endpoints/${endpoint.id}`}
          className="flex items-center gap-2 py-2 text-xs font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition"
        >
          <Radio className="h-3.5 w-3.5 text-zinc-500" />
          <span>Live Ingest Stream</span>
        </Link>

        <Link
          href={`/endpoints/${endpoint.id}/dlq`}
          className="flex items-center gap-2 py-2 text-xs font-medium border-b-2 border-rose-500 text-rose-400 transition"
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>Dead-Letter Queue & Triage</span>
          <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-mono text-rose-300">
            {dlqCount}
          </span>
        </Link>

        <Link
          href={`/endpoints/${endpoint.id}/schemas`}
          className="flex items-center gap-2 py-2 text-xs font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition"
        >
          <FileCode2 className="h-3.5 w-3.5 text-zinc-500" />
          <span>Contracts & Mutation Rules</span>
        </Link>
      </div>
    </div>
  );
}
