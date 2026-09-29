"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Radio,
  ShieldAlert,
  FileCode2,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { EndpointView } from "@/lib/endpoints-service";

interface SchemasHeaderProps {
  endpoint: EndpointView;
  activeRulesCount: number;
  totalHealedCount: number;
}

export function SchemasHeader({
  endpoint,
  activeRulesCount,
  totalHealedCount,
}: SchemasHeaderProps) {
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
            <span>Contracts & Mutation Rules</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>STRICT SCHEMA DEFENSE: ON</span>
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>In-Flight RFC 6902 Patching</span>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 pb-4 font-mono text-xs">
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[10px] tracking-wider">Active Mutation Rules</span>
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {activeRulesCount} Rules
          </div>
          <span className="text-[11px] text-zinc-500 font-sans">
            Promoted from DLQ self-healing
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[10px] tracking-wider">In-Flight Auto-Healed</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {totalHealedCount} Payloads
          </div>
          <span className="text-[11px] text-zinc-500 font-sans">
            Saved from DLQ quarantining
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[10px] tracking-wider">Target Contract Standard</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div className="text-sm font-semibold text-zinc-200 mt-0.5">
            Zod & JSON Schema Draft-07
          </div>
          <span className="text-[11px] text-zinc-500 font-sans">
            Deterministic validation before target dispatch
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
          className="flex items-center gap-2 py-2 text-xs font-medium border-b-2 border-transparent text-zinc-400 hover:text-rose-400 transition"
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
          <span>Dead-Letter Queue & Triage</span>
        </Link>

        <Link
          href={`/endpoints/${endpoint.id}/schemas`}
          className="flex items-center gap-2 py-2 text-xs font-medium border-b-2 border-emerald-500 text-emerald-400 transition"
        >
          <FileCode2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Contracts & Mutation Rules</span>
        </Link>
      </div>
    </div>
  );
}
