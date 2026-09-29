"use client";

import { useState } from "react";
import Link from "next/link";
import { EndpointView, HeaderMetricsData } from "@/lib/endpoints-service";
import { HeaderMetrics } from "./HeaderMetrics";
import { EndpointTable } from "./EndpointTable";
import { CreateEndpointModal } from "./CreateEndpointModal";
import {
  Plus,
  Search,
  ArrowLeft,
  Terminal,
  Activity,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface EndpointsShellProps {
  initialEndpoints: EndpointView[];
  initialMetrics: HeaderMetricsData;
}

export function EndpointsShell({
  initialEndpoints,
  initialMetrics,
}: EndpointsShellProps) {
  const [endpoints, setEndpoints] = useState<EndpointView[]>(initialEndpoints);
  const [metrics] = useState<HeaderMetricsData>(initialMetrics);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "dlq">("all");

  const handleCreateEndpoint = async (data: {
    name: string;
    targetUrl: string;
    secret: string;
    tier: "COMMUNITY" | "PRO";
  }) => {
    // Generate new endpoint ID
    const newId = `ep_${data.name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 14)}_${Math.random().toString(36).substring(2, 6)}`;

    const newEndpoint: EndpointView = {
      id: newId,
      name: data.name,
      targetUrl: data.targetUrl,
      secret: data.secret,
      tier: data.tier,
      rateLimit: data.tier === "PRO" ? 100 : 10,
      status: "ACTIVE",
      eventCount24h: 0,
      dlqCount: 0,
      errorRate: 0,
      createdAt: new Date().toISOString(),
    };

    setEndpoints((prev) => [newEndpoint, ...prev]);

    // Send API request if route exists or store locally
    try {
      await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Offline fallback: endpoint is retained in local state
    }
  };

  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesSearch =
      ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === "active") return ep.status === "ACTIVE";
    if (filterMode === "dlq") return ep.dlqCount > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Console Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            <span className="text-zinc-700">/</span>

            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Terminal className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-xs tracking-tight text-zinc-100">
                Endpoints Fleet Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gateway Ingestion Online</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-500 px-3 text-xs font-medium text-zinc-950 hover:bg-emerald-400 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Provision Endpoint</span>
            </button>

            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Endpoints Hub &amp; Quota Fleet
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Manage your high-throughput ingestion fleets, signature secrets, and dead-letter queue metrics.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Total Endpoints:</span>
            <span className="font-semibold text-zinc-200">{endpoints.length}</span>
          </div>
        </div>

        {/* 1. Header Metrics Cards */}
        <HeaderMetrics metrics={metrics} />

        {/* 2. Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search endpoints by name or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 rounded-md border border-zinc-800 bg-zinc-900/80 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-white/[0.08] bg-zinc-900/60 p-1 text-xs font-mono">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded transition ${
                filterMode === "all"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({endpoints.length})
            </button>

            <button
              onClick={() => setFilterMode("active")}
              className={`px-2.5 py-1 rounded transition ${
                filterMode === "active"
                  ? "bg-zinc-800 text-emerald-300"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Active ({endpoints.filter((e) => e.status === "ACTIVE").length})
            </button>

            <button
              onClick={() => setFilterMode("dlq")}
              className={`px-2.5 py-1 rounded transition ${
                filterMode === "dlq"
                  ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Poisoned ({endpoints.filter((e) => e.dlqCount > 0).length})
            </button>
          </div>
        </div>

        {/* 3. Endpoint Table */}
        <EndpointTable endpoints={filteredEndpoints} />
      </main>

      {/* Provision Endpoint Modal */}
      <CreateEndpointModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEndpoint}
      />
    </div>
  );
}
