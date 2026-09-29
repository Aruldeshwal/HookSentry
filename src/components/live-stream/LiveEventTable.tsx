"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Radio,
} from "lucide-react";
import type { WebhookEventView } from "@/lib/events-service";

interface LiveEventTableProps {
  events: WebhookEventView[];
  selectedEventId: string | null;
  onSelectEvent: (event: WebhookEventView) => void;
  endpointId: string;
}

export function LiveEventTable({
  events,
  selectedEventId,
  onSelectEvent,
  endpointId,
}: LiveEventTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyIdempotencyKey = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const timeStr = d.toISOString().slice(11, 23);
      const dateStr = d.toISOString().slice(0, 10);
      return { timeStr, rel: dateStr };
    } catch {
      return { timeStr: isoString, rel: "" };
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            <th className="py-2.5 px-4 sm:px-6 font-medium">Status</th>
            <th className="py-2.5 px-4 font-medium">Event Type</th>
            <th className="py-2.5 px-4 font-medium">Idempotency Key</th>
            <th className="py-2.5 px-4 font-medium">Timestamp</th>
            <th className="py-2.5 px-4 font-medium text-right">Latency</th>
            <th className="py-2.5 px-4 sm:px-6 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40 text-xs font-mono">
          {events.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <Radio className="h-6 w-6 text-zinc-600 animate-pulse" />
                    <span className="absolute h-8 w-8 rounded-full border border-zinc-800 animate-ping opacity-40" />
                  </div>
                  <div className="text-zinc-300 font-semibold mt-1">
                    Listening for incoming webhooks...
                  </div>
                  <div className="text-zinc-500 text-[11px] max-w-sm">
                    No events match your current filter. Trigger a webhook using the cURL command or click &quot;Simulate Webhook Delivery&quot; above.
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            events.map((event) => {
              const isSelected = event.id === selectedEventId;
              const { timeStr, rel } = formatTimestamp(event.createdAt);

              return (
                <tr
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className={`group cursor-pointer transition ${
                    isSelected
                      ? "bg-zinc-800/60"
                      : "hover:bg-zinc-900/60"
                  }`}
                >
                  {/* Status Badge */}
                  <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {event.status === "DELIVERED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>{event.responseStatus || 200} DELIVERED</span>
                        </span>
                      ) : event.status === "FAILED_DLQ" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] text-rose-400 font-medium">
                          <ShieldAlert className="h-3 w-3 text-rose-400" />
                          <span>{event.responseStatus || 422} FAILED DLQ</span>
                        </span>
                      ) : event.status === "RETRYING" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] text-amber-400 font-medium">
                          <Clock className="h-3 w-3 text-amber-400 animate-spin-slow" />
                          <span>RETRY ({event.attempts}/{event.maxAttempts})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 border border-zinc-700/50 px-2 py-0.5 text-[11px] text-zinc-400">
                          <span>PENDING</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Event Type */}
                  <td className="py-3 px-4 font-semibold text-zinc-200 whitespace-nowrap">
                    <span className="text-zinc-100">{event.eventType}</span>
                  </td>

                  {/* Idempotency Key */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-300">
                      <span className="font-mono text-[11px]">{event.idempotencyKey}</span>
                      <button
                        onClick={(e) => copyIdempotencyKey(event.idempotencyKey, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-zinc-200"
                        title="Copy Idempotency Key"
                      >
                        {copiedKey === event.idempotencyKey ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                    <div className="flex flex-col">
                      <span className="text-zinc-300">{timeStr}</span>
                      <span className="text-[10px] text-zinc-400">{rel}</span>
                    </div>
                  </td>

                  {/* Latency */}
                  <td className="py-3 px-4 text-right whitespace-nowrap text-zinc-400">
                    <span
                      className={`text-[11px] ${
                        event.latencyMs > 1000
                          ? "text-rose-400"
                          : event.latencyMs > 200
                          ? "text-amber-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {event.latencyMs}ms
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {event.status === "FAILED_DLQ" && (
                        <Link
                          href={`/endpoints/${endpointId}/dlq/${event.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2 py-1 text-[11px] font-medium border border-rose-500/30 transition"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          <span>Triage DLQ</span>
                        </Link>
                      )}

                      <button
                        onClick={() => onSelectEvent(event)}
                        className="inline-flex items-center gap-1 rounded border border-zinc-700/60 hover:border-zinc-500 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 px-2 py-1 text-[11px] transition"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="h-3 w-3 text-zinc-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
