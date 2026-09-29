import { notFound } from "next/navigation";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { getEndpointById } from "@/lib/events-service";
import {
  getTargetContractByEndpointId,
  getMutationRulesByEndpointId,
} from "@/lib/schemas-service";
import { SchemasShell } from "@/components/schemas/SchemasShell";

interface PageProps {
  params: Promise<{ endpointId: string }>;
}

export default async function EndpointSchemasPage({ params }: PageProps) {
  const { endpointId } = await params;

  const endpoint = await getEndpointById(endpointId);
  if (!endpoint) {
    notFound();
  }

  const contract = await getTargetContractByEndpointId(endpointId);
  const rules = await getMutationRulesByEndpointId(endpointId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
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
              <span className="font-semibold text-xs tracking-tight text-emerald-400 font-mono">
                Contracts & Rules
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Rules Engine Online</span>
            </div>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7 rounded-md border border-zinc-700",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Contracts & Rules Workspace */}
      <main className="flex-1 flex flex-col">
        <SchemasShell
          endpoint={endpoint}
          contract={contract}
          initialRules={rules}
        />
      </main>
    </div>
  );
}
