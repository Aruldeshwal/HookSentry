import { notFound } from "next/navigation";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { getEndpointById } from "@/lib/events-service";
import { getDlqEventsByEndpointId } from "@/lib/events-service";
import { DlqHeader } from "@/components/dlq/DlqHeader";
import { DlqTable } from "@/components/dlq/DlqTable";

interface PageProps {
  params: Promise<{ endpointId: string }>;
}

export default async function EndpointDlqPage({ params }: PageProps) {
  const { endpointId } = await params;

  const endpoint = await getEndpointById(endpointId);
  if (!endpoint) {
    notFound();
  }

  const dlqEvents = await getDlqEventsByEndpointId(endpointId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500/20 selection:text-rose-300">
      {/* Top Console Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-zinc-200 hidden sm:inline">HookSentry</span>
            </Link>

            <span className="text-zinc-700">/</span>

            <Link
              href="/endpoints"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Fleet Hub
            </Link>

            <span className="text-zinc-700">/</span>

            <Link
              href={`/endpoints/${endpoint.id}`}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition font-mono"
            >
              {endpoint.name}
            </Link>

            <span className="text-zinc-700">/</span>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight text-rose-400 font-mono">
                DLQ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-mono text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>Quarantine Watcher Online</span>
            </div>

            <UserButton />
          </div>
        </div>
      </header>

      {/* Main DLQ Dashboard */}
      <main className="flex-1 flex flex-col">
        <DlqHeader endpoint={endpoint} dlqCount={dlqEvents.length} />
        <div className="flex-1 bg-zinc-950 p-4 sm:p-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Quarantined Poisoned Webhooks</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Events routed to Dead-Letter Queue due to downstream HTTP 4xx/5xx rejection.
                </p>
              </div>
            </div>
            <DlqTable events={dlqEvents} endpointId={endpoint.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
