"use client";

import { useState } from "react";
import {
  Search,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  AlertOctagon,
  Clock,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

export type EventStatusFilter = "ALL" | "DELIVERED" | "FAILED_DLQ" | "RETRYING" | "PENDING";

interface StreamControlBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: EventStatusFilter;
  onStatusFilterChange: (status: EventStatusFilter) => void;
  isStreamPaused: boolean;
  onTogglePauseStream: () => void;
  onClearStream: () => void;
  counts: {
    all: number;
    delivered: number;
    failedDlq: number;
    retrying: number;
    pending: number;
  };
  isConnected: boolean;
  onSimulateWebhook: (type: "valid" | "drift_422" | "error_500") => Promise<void>;
  isSimulating: boolean;
}

export function StreamControlBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isStreamPaused,
  onTogglePauseStream,
  onClearStream,
  counts,
  isConnected,
  onSimulateWebhook,
  isSimulating,
}: StreamControlBarProps) {
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  const handleSimulate = async (type: "valid" | "drift_422" | "error_500") => {
    setShowSimulateMenu(false);
    await onSimulateWebhook(type);
  };

  return (
    <div className="flex flex-col gap-3 px-4 sm:px-8 py-3.5 border-b border-zinc-800/60 bg-zinc-950/60">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: SSE Status Pill & Pause Toggle */}
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-mono border ${
              isStreamPaused
                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                : isConnected
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-300 border-rose-500/20"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isStreamPaused
                  ? "bg-amber-400"
                  : isConnected
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-rose-400"
              }`}
            />
            <span>
              {isStreamPaused
                ? "STREAM PAUSED"
                : isConnected
                ? "SSE LIVE FEED (28ms)"
                : "CONNECTING..."}
            </span>
          </div>

          <button
            onClick={onTogglePauseStream}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-300 transition"
            title={isStreamPaused ? "Resume live stream" : "Pause live stream"}
          >
            {isStreamPaused ? (
              <>
                <Play className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            onClick={onClearStream}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition"
            title="Clear current stream view"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Right: Quick Simulate Webhook Button */}
        <div className="relative">
          <button
            onClick={() => setShowSimulateMenu(!showSimulateMenu)}
            disabled={isSimulating}
            className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 transition"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" />
              <span>{isSimulating ? "Ingesting..." : "Simulate Webhook Delivery"}</span>
            </div>
            <ChevronDown className="h-3 w-3 text-emerald-400" />
          </button>

          {showSimulateMenu && (
            <div className="absolute right-0 top-full mt-1.5 z-40 w-72 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Trigger Real-time Webhook Event
              </div>
              <button
                onClick={() => handleSimulate("valid")}
                className="w-full text-left rounded-md px-2.5 py-2 text-xs hover:bg-zinc-900 flex items-start gap-2 text-zinc-200 transition"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-none mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-400">200 OK Delivery</div>
                  <div className="text-[11px] text-zinc-400">
                    payment_intent.succeeded (Matched schema)
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleSimulate("drift_422")}
                className="w-full text-left rounded-md px-2.5 py-2 text-xs hover:bg-zinc-900 flex items-start gap-2 text-zinc-200 transition"
              >
                <AlertOctagon className="h-4 w-4 text-rose-400 flex-none mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-400">422 Schema Drift (DLQ)</div>
                  <div className="text-[11px] text-zinc-400">
                    customer.subscription.updated (Missing customer_id)
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleSimulate("error_500")}
                className="w-full text-left rounded-md px-2.5 py-2 text-xs hover:bg-zinc-900 flex items-start gap-2 text-zinc-200 transition"
              >
                <Clock className="h-4 w-4 text-amber-400 flex-none mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-400">500 Target Timeout (Retry)</div>
                  <div className="text-[11px] text-zinc-400">
                    Downstream connection failure (Backoff queued)
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onStatusFilterChange("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition ${
              statusFilter === "ALL"
                ? "bg-zinc-800 text-white font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <span>ALL</span>
            <span className="rounded bg-zinc-900 px-1 py-0.2 text-[10px] text-zinc-400">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange("DELIVERED")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition ${
              statusFilter === "DELIVERED"
                ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                : "text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>DELIVERED</span>
            <span className="rounded bg-zinc-900 px-1 py-0.2 text-[10px] text-emerald-400">
              {counts.delivered}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange("FAILED_DLQ")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition ${
              statusFilter === "FAILED_DLQ"
                ? "bg-rose-500/20 text-rose-300 font-semibold"
                : "text-zinc-400 hover:text-rose-400 hover:bg-zinc-900"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>FAILED DLQ</span>
            <span className="rounded bg-zinc-900 px-1 py-0.2 text-[10px] text-rose-400">
              {counts.failedDlq}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange("RETRYING")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition ${
              statusFilter === "RETRYING"
                ? "bg-amber-500/20 text-amber-300 font-semibold"
                : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-900"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>RETRYING</span>
            <span className="rounded bg-zinc-900 px-1 py-0.2 text-[10px] text-amber-400">
              {counts.retrying}
            </span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search idempotency key, event type..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/90 pl-8 pr-3 py-1 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>
    </div>
  );
}
