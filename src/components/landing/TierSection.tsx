"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export function TierSection() {
  const [selectedTier, setSelectedTier] = useState<"community" | "pro" | "enterprise">("community");

  const tiers = [
    {
      id: "community" as const,
      name: "Community",
      badge: "Open Source / Self-Hosted",
      price: "$0",
      period: "forever",
      description: "For individual developers and early projects needing zero-loss ingestion.",
      features: [
        "10 requests/sec token-bucket rate limit",
        "3 exponential retry attempts (1s, 5s, 25s)",
        "PostgreSQL SKIP LOCKED queue engine",
        "24-hour event retention in DLQ",
        "Manual RFC 6902 mutation patch review",
        "Standard HMAC-SHA256 signature verification",
      ],
      ctaText: "Get Started Free",
      ctaHref: "/auth/sign-up",
      highlight: false,
    },
    {
      id: "pro" as const,
      name: "Pro",
      badge: "Production Fleet",
      price: "$49",
      period: "per month",
      description: "For scaling engineering teams operating mission-critical payment & data hooks.",
      features: [
        "100 requests/sec token-bucket rate limit",
        "Unlimited custom retry policies with jitter",
        "Automated AI schema drift triage & RFC 6902 patch generation",
        "30-day poisoned payload retention in DLQ",
        "One-click mutation replay & permanent rule promotion",
        "Real-time Server-Sent Events (SSE) telemetry stream",
        "Custom alerting over Slack & PagerDuty",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaHref: "/auth/sign-up",
      highlight: true,
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      badge: "High Throughput",
      price: "Custom",
      period: "annual",
      description: "For high-volume platforms requiring dedicated infrastructure and custom SLAs.",
      features: [
        "10,000+ requests/sec dedicated Redis cluster",
        "Dedicated VPC peering & private edge worker nodes",
        "Custom LLM fine-tuned on internal schema models",
        "Indefinite audit trail & compliance retention",
        "99.99% Ingestion Availability SLA",
        "24/7 dedicated engineering support",
      ],
      ctaText: "Contact Infrastructure Team",
      ctaHref: "https://github.com/Aruldeshwal/HookSentry",
      highlight: false,
    },
  ];

  return (
    <section id="tiers" className="py-16 sm:py-20 border-b border-white/[0.06] bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Tier Quotas &amp; Ingestion Defense
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Predictable multi-tenant capacity enforced at the edge via Redis token-bucket algorithms before state writes.
            </p>
          </div>

          {/* Interactive Tier Switcher */}
          <div className="flex rounded-lg border border-white/[0.08] bg-zinc-900/60 p-1">
            <button
              onClick={() => setSelectedTier("community")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                selectedTier === "community"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Community (10 req/s)
            </button>
            <button
              onClick={() => setSelectedTier("pro")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                selectedTier === "pro"
                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Pro (100 req/s)
            </button>
            <button
              onClick={() => setSelectedTier("enterprise")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                selectedTier === "enterprise"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Enterprise (10k+ req/s)
            </button>
          </div>
        </div>

        {/* Tier Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative flex flex-col justify-between rounded-xl border p-6 transition cursor-pointer ${
                  isSelected
                    ? "border-emerald-500/40 bg-zinc-900/70 shadow-lg shadow-emerald-950/20"
                    : "border-white/[0.08] bg-zinc-900/20 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-400">{tier.name}</span>
                    <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                      {tier.badge}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-semibold text-zinc-100">{tier.price}</span>
                    <span className="text-xs text-zinc-500">/{tier.period}</span>
                  </div>

                  <p className="mt-3 text-xs text-zinc-400 leading-relaxed min-h-[36px]">
                    {tier.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-2.5">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href={tier.ctaHref}
                    className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium transition ${
                      isSelected
                        ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                        : "border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-850 hover:text-white"
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
