"use client";

import { useState } from "react";
import type { EndpointView } from "@/lib/endpoints-service";
import type {
  TargetContractView,
  MutationRuleView,
} from "@/lib/schemas-service";
import { SchemasHeader } from "./SchemasHeader";
import { ContractEditor } from "./ContractEditor";
import { MutationRulesList } from "./MutationRulesList";
import { InteractiveContractTester } from "./InteractiveContractTester";
import { Layers, FileCode2, Sparkles } from "lucide-react";

interface SchemasShellProps {
  endpoint: EndpointView;
  contract: TargetContractView;
  initialRules: MutationRuleView[];
}

export function SchemasShell({
  endpoint,
  contract,
  initialRules,
}: SchemasShellProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "contract" | "sandbox">("rules");
  const [rules] = useState<MutationRuleView[]>(initialRules);

  const activeRulesCount = rules.filter((r) => r.isActive).length;
  const totalHealedCount = rules.reduce((sum, r) => sum + r.healedCount, 0);

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-zinc-950 font-sans">
      <SchemasHeader
        endpoint={endpoint}
        activeRulesCount={activeRulesCount}
        totalHealedCount={totalHealedCount}
      />

      <div className="flex-1 p-4 sm:p-8 flex flex-col gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
              activeTab === "rules"
                ? "bg-zinc-800 text-white font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Active Mutation Rules ({rules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contract")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
              activeTab === "contract"
                ? "bg-zinc-800 text-white font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Downstream Target Contract</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
              activeTab === "sandbox"
                ? "bg-zinc-800 text-white font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive Patch Sandbox</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === "rules" && (
          <MutationRulesList
            endpointId={endpoint.id}
            initialRules={rules}
          />
        )}

        {activeTab === "contract" && (
          <ContractEditor contract={contract} />
        )}

        {activeTab === "sandbox" && (
          <InteractiveContractTester
            endpointId={endpoint.id}
            rules={rules}
          />
        )}
      </div>
    </div>
  );
}
