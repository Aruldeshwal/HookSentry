"use client";

import { useState } from "react";
import { X, Key, Shield, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

interface CreateEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    targetUrl: string;
    secret: string;
    tier: "COMMUNITY" | "PRO";
  }) => Promise<void>;
}

export function CreateEndpointModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEndpointModalProps) {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [tier, setTier] = useState<"COMMUNITY" | "PRO">("PRO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateSecret = () => {
    const chars = "abcdef0123456789";
    let token = "";
    for (let i = 0; i < 28; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecret(`whsec_${token}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide an endpoint name.");
      return;
    }

    if (!targetUrl.trim() || !targetUrl.startsWith("http")) {
      setError("Please provide a valid destination URL (http:// or https://).");
      return;
    }

    const signingSecret = secret.trim() || `whsec_${Math.random().toString(36).substring(2, 15)}`;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        targetUrl: targetUrl.trim(),
        secret: signingSecret,
        tier,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create endpoint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-white/[0.1] bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">
                Provision New Webhook Endpoint
              </h3>
              <p className="text-xs text-zinc-400">
                Setup ingestion gateway routing and signing verification.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Input 1: Endpoint Name */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Endpoint Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stripe Production Billing"
              className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
            />
          </div>

          {/* Input 2: Destination Target URL */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Destination Target URL
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhooks/incoming"
              className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Downstream consumer target service where verified webhooks will be dispatched.
            </p>
          </div>

          {/* Input 3: Webhook Signing Secret */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-300">
                Webhook Signing Secret
              </label>
              <button
                type="button"
                onClick={generateSecret}
                className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition"
              >
                <Key className="h-3 w-3" />
                <span>Auto-generate</span>
              </button>
            </div>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="whsec_9f83a00c714b2... (or click Auto-generate)"
              className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
            />
          </div>

          {/* Tier Selection */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Ingestion Tier Quota
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTier("COMMUNITY")}
                className={`rounded-md border p-2.5 text-left transition ${
                  tier === "COMMUNITY"
                    ? "border-emerald-500/40 bg-zinc-900 text-zinc-100"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="text-xs font-medium">Community</div>
                <div className="text-[10px] font-mono text-zinc-500">10 req/s · 3 retries</div>
              </button>

              <button
                type="button"
                onClick={() => setTier("PRO")}
                className={`rounded-md border p-2.5 text-left transition ${
                  tier === "PRO"
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="text-xs font-medium">Pro Fleet</div>
                <div className="text-[10px] font-mono text-zinc-500">100 req/s · AI DLQ Triage</div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-3.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>Create Endpoint</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
