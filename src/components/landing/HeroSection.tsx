"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Terminal } from "lucide-react";

export function HeroSection() {
  const [copied, setCopied] = useState(false);
  const installCmd = "npm i @hooksentry/sdk";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 border-b border-white/[0.06] bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-3xl font-semibold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
          Distributed Webhook Ingestion &amp; Self-Healing Dead-Letter Queue
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Guaranteed zero message loss with PostgreSQL ACID state machines. When breaking
          upstream schema drifts trigger downstream 4xx failures, an isolated triage engine
          generates deterministic RFC 6902 mutation patches for safe, one-click replay.
        </p>

        {/* Action Controls & Quick CLI */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#sandbox"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-100 px-4 text-xs font-medium text-zinc-900 transition hover:bg-white shadow-sm"
          >
            Launch Live Sandbox
          </a>

          <Link
            href="/endpoints"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/[0.1] bg-zinc-900/80 px-4 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
            <span>Fleet View</span>
            <ArrowRight className="h-3 w-3 text-zinc-400" />
          </Link>

          {/* Quick Copy Command */}
          <div className="flex h-9 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/90 px-3 font-mono text-xs text-zinc-400">
            <span className="text-zinc-600">$</span>
            <span className="text-zinc-300">{installCmd}</span>
            <button
              onClick={handleCopy}
              className="ml-1 text-zinc-500 hover:text-zinc-300 transition"
              title="Copy install command"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="mt-12 grid grid-cols-2 gap-px rounded-lg border border-white/[0.08] bg-white/[0.04] sm:grid-cols-4 max-w-4xl mx-auto overflow-hidden">
          <div className="bg-zinc-950 p-4 text-left">
            <div className="font-mono text-xs text-zinc-500">Ingestion Latency</div>
            <div className="mt-1 font-mono text-xl font-medium tabular-nums text-zinc-100">
              18.4ms <span className="text-xs font-normal text-emerald-400">p99</span>
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500">Edge route write-path</div>
          </div>

          <div className="bg-zinc-950 p-4 text-left">
            <div className="font-mono text-xs text-zinc-500">Delivery Guarantee</div>
            <div className="mt-1 font-mono text-xl font-medium text-zinc-100">
              At-Least-Once
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500">Transactional outbox</div>
          </div>

          <div className="bg-zinc-950 p-4 text-left">
            <div className="font-mono text-xs text-zinc-500">Idempotency Lock</div>
            <div className="mt-1 font-mono text-xl font-medium text-zinc-100">
              0 Race Cond.
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500">SKIP LOCKED concurrency</div>
          </div>

          <div className="bg-zinc-950 p-4 text-left">
            <div className="font-mono text-xs text-zinc-500">DLQ Triage Engine</div>
            <div className="mt-1 font-mono text-xl font-medium text-purple-300">
              RFC 6902
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500">Zod-bounded patches</div>
          </div>
        </div>
      </div>
    </section>
  );
}
