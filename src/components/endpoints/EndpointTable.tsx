"use client";

import { useState } from "react";
import Link from "next/link";
import { EndpointView } from "@/lib/endpoints-service";
import {
  Copy,
  Check,
  Radio,
  FileCode2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

interface EndpointTableProps {
  endpoints: EndpointView[];
  onDeleteEndpoint?: (id: string) => void;
}

export function EndpointTable({ endpoints }: EndpointTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIngestionUrl = (id: string) => {
    return `https://api.hooksentry.io/v1/ingest/${id}`;
  };

  const handleCopyUrl = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(getIngestionUrl(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/30">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-zinc-900/70 font-mono text-[11px] text-zinc-400">
              <th scope="col" className="py-3 pl-4 pr-3 font-medium sm:pl-6">
                Status
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Endpoint Fleet Name
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Generated Public Ingestion URL
              </th>
              <th scope="col" className="px-3 py-3 font-medium text-right">
                24H Events
              </th>
              <th scope="col" className="px-3 py-3 font-medium text-right">
                Poisoned DLQ
              </th>
              <th scope="col" className="py-3 pl-3 pr-4 font-medium text-right sm:pr-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {endpoints.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500">
                  No webhook endpoints provisioned yet. Click &quot;Provision Endpoint&quot; to begin.
                </td>
              </tr>
            ) : (
              endpoints.map((ep) => {
                const isCopied = copiedId === ep.id;
                const hasDlqErrors = ep.dlqCount > 0;

                return (
                  <tr
                    key={ep.id}
                    className="group transition hover:bg-white/[0.02]"
                  >
                    {/* Status Badge */}
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center gap-2">
                        {ep.status === "ACTIVE" && (
                          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            ACTIVE
                          </span>
                        )}
                        {ep.status === "DEGRADED" && (
                          <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                            DEGRADED
                          </span>
                        )}
                        {ep.status === "PAUSED" && (
                          <span className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500"></span>
                            PAUSED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Endpoint Name & Target URL */}
                    <td className="px-3 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/endpoints/${ep.id}`}
                          className="font-medium text-zinc-200 hover:text-white transition truncate"
                        >
                          {ep.name}
                        </Link>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-400">
                          {ep.tier}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-zinc-500 truncate flex items-center gap-1">
                        <span>-&gt; {ep.targetUrl}</span>
                      </div>
                    </td>

                    {/* Generated Public Ingestion URL */}
                    <td className="px-3 py-4 font-mono text-xs">
                      <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300 w-fit max-w-[280px]">
                        <span className="truncate">{getIngestionUrl(ep.id)}</span>
                        <button
                          onClick={(e) => handleCopyUrl(ep.id, e)}
                          title="Copy Public Ingestion URL"
                          className="text-zinc-500 hover:text-zinc-300 transition flex-shrink-0"
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 24H Event Volume */}
                    <td className="whitespace-nowrap px-3 py-4 text-right font-mono text-zinc-300 tabular-nums">
                      {ep.eventCount24h.toLocaleString()}
                    </td>

                    {/* DLQ Count */}
                    <td className="whitespace-nowrap px-3 py-4 text-right font-mono tabular-nums">
                      {hasDlqErrors ? (
                        <Link
                          href={`/endpoints/${ep.id}`}
                          className="inline-flex items-center gap-1 rounded bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-xs text-rose-300 hover:bg-rose-900/60 transition"
                        >
                          <AlertTriangle className="h-3 w-3 text-rose-400" />
                          <span>{ep.dlqCount} poisoned</span>
                        </Link>
                      ) : (
                        <span className="text-zinc-500">0</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/endpoints/${ep.id}`}
                          className="inline-flex items-center gap-1 rounded border border-white/[0.08] bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                          title="Live Ingestion Stream"
                        >
                          <Radio className="h-3 w-3 text-emerald-400" />
                          <span>Stream</span>
                        </Link>

                        <Link
                          href={`/endpoints/${ep.id}/schemas`}
                          className="inline-flex items-center gap-1 rounded border border-white/[0.08] bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                          title="Zod & JSON Schemas"
                        >
                          <FileCode2 className="h-3 w-3 text-purple-400" />
                          <span>Schemas</span>
                        </Link>

                        <Link
                          href={`/endpoints/${ep.id}`}
                          className="text-zinc-600 hover:text-zinc-300 transition"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
