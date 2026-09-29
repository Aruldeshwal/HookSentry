"use client";

import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import type { WebhookEventView } from "@/lib/events-service";

interface DlqTableProps {
  events: WebhookEventView[];
  endpointId: string;
}

export function DlqTable({ events, endpointId }: DlqTableProps) {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toISOString().slice(11, 23);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse font-mono text-xs">
        <thead>
          <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[11px] uppercase tracking-wider text-zinc-400">
            <th className="py-3 px-4 sm:px-6 font-medium">Event & Key</th>
            <th className="py-3 px-4 font-medium">Downstream Error Reason</th>
            <th className="py-3 px-4 font-medium">Retry Attempts</th>
            <th className="py-3 px-4 font-medium">Quarantined At</th>
            <th className="py-3 px-4 sm:px-6 font-medium text-right">Triage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {events.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <div className="text-zinc-200 font-semibold mt-1">
                    Dead-Letter Queue is Clean
                  </div>
                  <div className="text-zinc-500 text-xs max-w-sm font-sans">
                    Zero quarantined webhooks. All incoming payloads have been successfully delivered to the downstream target service.
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr
                key={event.id}
                className="group hover:bg-zinc-900/50 transition cursor-pointer"
              >
                {/* Event Name & Idempotency Key */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-zinc-100 flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400 flex-none" />
                      <span>{event.eventType}</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {event.idempotencyKey}
                    </span>
                  </div>
                </td>

                {/* Downstream Error */}
                <td className="py-3.5 px-4 max-w-md">
                  <div className="text-rose-300 text-xs line-clamp-2 bg-rose-950/20 px-2 py-1 rounded border border-rose-900/30">
                    {event.lastError || "HTTP 422: Target service rejected payload."}
                  </div>
                </td>

                {/* Attempts */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
                    <Clock className="h-3 w-3 text-zinc-500" />
                    <span>{event.attempts} of {event.maxAttempts} failed</span>
                  </span>
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400">
                  <span>{formatTime(event.createdAt)}</span>
                </td>

                {/* Action: Open Triage */}
                <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                  <Link
                    href={`/endpoints/${endpointId}/dlq/${event.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 px-3 py-1.5 text-xs font-semibold transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                    <span>AI Triage</span>
                    <ArrowRight className="h-3 w-3 text-rose-400" />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
