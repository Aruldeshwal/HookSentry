import { HeaderMetricsData } from "@/lib/endpoints-service";
import { AlertOctagon, Activity, Percent, ShieldCheck } from "lucide-react";

interface HeaderMetricsProps {
  metrics: HeaderMetricsData;
}

export function HeaderMetrics({ metrics }: HeaderMetricsProps) {
  const hasPoisoned = metrics.poisonedDlqCount > 0;
  const usagePercentage = Math.round(
    (metrics.currentUsageReqSec / metrics.maxTierQuotaReqSec) * 100
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Count of poisoned payloads in DLQ */}
      <div className={`rounded-xl border p-4 bg-zinc-900/40 transition ${
        hasPoisoned
          ? "border-rose-500/30 bg-rose-950/10 shadow-sm shadow-rose-950/20"
          : "border-white/[0.08]"
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-400">Poisoned in DLQ</span>
          <div className={`flex h-6 w-6 items-center justify-center rounded-md border ${
            hasPoisoned
              ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          }`}>
            <AlertOctagon className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className={`font-mono text-2xl font-semibold tabular-nums ${
            hasPoisoned ? "text-rose-400" : "text-zinc-100"
          }`}>
            {metrics.poisonedDlqCount}
          </span>
          <span className="text-xs text-zinc-500">quarantined</span>
        </div>

        <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1.5">
          {hasPoisoned ? (
            <span className="text-rose-400 font-medium">Requires AI triage &amp; replay</span>
          ) : (
            <span className="text-emerald-400 font-medium">Zero dead-letter events</span>
          )}
        </div>
      </div>

      {/* Metric 2: 24H Event Volume */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-400">24H Event Volume</span>
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-zinc-900 text-zinc-400">
            <Activity className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold text-zinc-100 tabular-nums">
            {metrics.eventVolume24h.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-500">events</span>
        </div>

        <div className="mt-2 text-[11px] text-zinc-500">
          <span>Avg throughput: ~{(metrics.eventVolume24h / 86400).toFixed(1)} req/s</span>
        </div>
      </div>

      {/* Metric 3: Ingestion Error Rate Percentage */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-400">Ingestion Error Rate</span>
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-zinc-900 text-zinc-400">
            <Percent className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold text-zinc-100 tabular-nums">
            {metrics.ingestionErrorRate}%
          </span>
          <span className="text-xs text-zinc-500">unhandled</span>
        </div>

        <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1.5">
          <span className="text-emerald-400 font-medium">99.16% SLA</span>
          <span>across all endpoints</span>
        </div>
      </div>

      {/* Metric 4: Active Tier Usage Tracker */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-zinc-400">Tier Quota Usage</span>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1 py-0.2 text-[9px] font-mono text-emerald-400">
              {metrics.activeTier}
            </span>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-zinc-900 text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono">
          <span className="text-2xl font-semibold text-zinc-100 tabular-nums">
            {metrics.currentUsageReqSec}
          </span>
          <span className="text-xs text-zinc-500">/ {metrics.maxTierQuotaReqSec} req/s</span>
        </div>

        {/* Capacity Bar */}
        <div className="mt-2.5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercentage > 85 ? "bg-amber-400" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
