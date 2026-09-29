"use client";

import { useState } from "react";
import {
  FileCode2,
  Copy,
  Check,
  ShieldCheck,
  Save,
} from "lucide-react";
import type { TargetContractView } from "@/lib/schemas-service";

interface ContractEditorProps {
  contract: TargetContractView;
}

export function ContractEditor({ contract }: ContractEditorProps) {
  const [activeTab, setActiveTab] = useState<"jsonSchema" | "zod">("jsonSchema");
  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(contract.jsonSchema, null, 2)
  );
  const [isSaved, setIsSaved] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    try {
      JSON.parse(jsonText);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch {
      alert("Invalid JSON Schema format");
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-lg">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <FileCode2 className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white font-mono">
            {contract.schemaTitle}
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Enforced
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Switcher */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 font-mono text-xs">
            <button
              onClick={() => setActiveTab("jsonSchema")}
              className={`px-2.5 py-1 rounded transition ${
                activeTab === "jsonSchema"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              JSON Schema
            </button>
            <button
              onClick={() => setActiveTab("zod")}
              className={`px-2.5 py-1 rounded transition ${
                activeTab === "zod"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Zod TypeScript
            </button>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                activeTab === "jsonSchema" ? jsonText : contract.zodCode
              )
            }
            className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>Copy</span>
          </button>

          {activeTab === "jsonSchema" && (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-950 bg-emerald-500 hover:bg-emerald-400 px-3 py-1 rounded transition"
            >
              {isSaved ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{isSaved ? "Saved" : "Save Contract"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 bg-zinc-950/70 font-mono text-xs">
        {activeTab === "jsonSchema" ? (
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={14}
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500/50 resize-y"
          />
        ) : (
          <pre className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-emerald-300 overflow-x-auto whitespace-pre selection:bg-emerald-500/30">
            {contract.zodCode}
          </pre>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 border-t border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Validates all raw & mutated webhooks before downstream dispatch.</span>
        </div>
        <div className="text-zinc-500">
          Last updated: {new Date(contract.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
