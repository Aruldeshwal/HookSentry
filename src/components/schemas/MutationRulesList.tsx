"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Code2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import type { MutationRuleView } from "@/lib/schemas-service";
import type { Operation } from "fast-json-patch";

interface MutationRulesListProps {
  endpointId: string;
  initialRules: MutationRuleView[];
}

export function MutationRulesList({
  endpointId,
  initialRules,
}: MutationRulesListProps) {
  const [rules, setRules] = useState<MutationRuleView[]>(initialRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [newRuleEventMatch, setNewRuleEventMatch] = useState("*");
  const [newRuleOp, setNewRuleOp] = useState<"copy" | "add" | "replace" | "move" | "remove">("copy");
  const [newRulePath, setNewRulePath] = useState("/customer_id");
  const [newRuleFrom, setNewRuleFrom] = useState("/billing_customer/id");
  const [newRuleValue, setNewRuleValue] = useState("");

  const handleToggle = async (ruleId: string, currentActive: boolean) => {
    const updated = !currentActive;
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: updated } : r))
    );

    try {
      await fetch(`/api/endpoints/${endpointId}/schemas/rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updated }),
      });
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this mutation rule?")) return;

    setRules((prev) => prev.filter((r) => r.id !== ruleId));

    try {
      await fetch(`/api/endpoints/${endpointId}/schemas/rules/${ruleId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    let patchOp: Operation;
    if (newRuleOp === "copy" || newRuleOp === "move") {
      patchOp = { op: newRuleOp, from: newRuleFrom, path: newRulePath };
    } else if (newRuleOp === "remove") {
      patchOp = { op: "remove", path: newRulePath };
    } else {
      let val: unknown = newRuleValue;
      try {
        val = JSON.parse(newRuleValue);
      } catch {
        // use string
      }
      patchOp = { op: newRuleOp, path: newRulePath, value: val };
    }

    try {
      const res = await fetch(`/api/endpoints/${endpointId}/schemas/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRuleName,
          description: newRuleDesc,
          eventTypeMatch: newRuleEventMatch,
          patches: [patchOp],
        }),
      });

      const data = await res.json();
      if (data.rule) {
        setRules((prev) => [data.rule, ...prev]);
        setIsModalOpen(false);
        setNewRuleName("");
        setNewRuleDesc("");
      }
    } catch (err) {
      console.error("Create rule error:", err);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-lg flex flex-col">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <Layers className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Active RFC 6902 Mutation Rules
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {rules.filter((r) => r.isActive).length} Active
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-950 bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-md transition shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Mutation Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="divide-y divide-zinc-800/60 font-mono text-xs">
        {rules.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No permanent mutation rules configured. Rules promoted from the DLQ triage engine will automatically appear here.
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 flex flex-col gap-3 transition ${
                rule.isActive ? "bg-zinc-950/40" : "bg-zinc-950/80 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(rule.id, rule.isActive)}
                    className="p-1 text-zinc-400 hover:text-white transition mt-0.5"
                    title={rule.isActive ? "Click to Pause Rule" : "Click to Activate Rule"}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-zinc-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 font-sans text-sm">
                        {rule.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {rule.eventTypeMatch}
                      </span>
                      {rule.isActive && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          Active in gateway
                        </span>
                      )}
                    </div>
                    {rule.description && (
                      <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-2xl">
                        {rule.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
                    <span className="text-emerald-400 font-bold">{rule.healedCount}</span> payloads auto-healed
                  </div>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition"
                    title="Delete rule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Patches Operations Breakdown */}
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3 ml-9">
                <div className="text-[10px] uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                  <Code2 className="h-3 w-3 text-emerald-400" />
                  <span>Deterministic RFC 6902 Patch Instructions</span>
                </div>
                <div className="space-y-1.5">
                  {rule.patches.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        {p.op}
                      </span>
                      {"from" in p && (
                        <span className="text-zinc-400">
                          from <span className="text-zinc-200">{p.from}</span>
                        </span>
                      )}
                      <span className="text-zinc-400">
                        target <span className="text-zinc-200 font-semibold">{p.path}</span>
                      </span>
                      {"value" in p && (
                        <span className="text-zinc-400">
                          value <span className="text-emerald-300">{JSON.stringify(p.value)}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Author RFC 6902 Mutation Rule
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-100 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 mt-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Map customer_id from billing_customer"
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Event Type Filter Pattern</label>
                <input
                  type="text"
                  value={newRuleEventMatch}
                  onChange={(e) => setNewRuleEventMatch(e.target.value)}
                  placeholder="e.g. orders.create or *"
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">RFC 6902 Operation</label>
                  <select
                    value={newRuleOp}
                    onChange={(e) => setNewRuleOp(e.target.value as "copy" | "add" | "replace" | "move" | "remove")}
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="copy">copy</option>
                    <option value="add">add</option>
                    <option value="replace">replace</option>
                    <option value="move">move</option>
                    <option value="remove">remove</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Target JSON Path</label>
                  <input
                    type="text"
                    required
                    value={newRulePath}
                    onChange={(e) => setNewRulePath(e.target.value)}
                    placeholder="/customer_id"
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {(newRuleOp === "copy" || newRuleOp === "move") && (
                <div>
                  <label className="block text-zinc-400 mb-1">Source JSON Path (&apos;from&apos;)</label>
                  <input
                    type="text"
                    required
                    value={newRuleFrom}
                    onChange={(e) => setNewRuleFrom(e.target.value)}
                    placeholder="/billing_customer/id"
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              {(newRuleOp === "add" || newRuleOp === "replace") && (
                <div>
                  <label className="block text-zinc-400 mb-1">Value (JSON or String)</label>
                  <input
                    type="text"
                    value={newRuleValue}
                    onChange={(e) => setNewRuleValue(e.target.value)}
                    placeholder='"cus_default"'
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1">Description / Notes</label>
                <textarea
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  rows={2}
                  placeholder="Rationale for in-flight transformation..."
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
