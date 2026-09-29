"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Terminal,
  KeyRound,
  Shield,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

interface AuthContainerProps {
  mode: "sign-in" | "sign-up";
}

export function AuthContainer({ mode }: AuthContainerProps) {
  const router = useRouter();

  // Detect whether Clerk key is a dummy placeholder or live
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const isPlaceholderKey =
    !publishableKey ||
    publishableKey.includes("patient-moray-650") ||
    !publishableKey.startsWith("pk_");

  // Tab: 'operator' | 'clerk'
  const [activeTab, setActiveTab] = useState<"operator" | "clerk">(
    isPlaceholderKey ? "operator" : "clerk"
  );

  // Form states for Operator Dev Access
  const [email, setEmail] = useState("operator@hooksentry.dev");
  const [clusterName, setClusterName] = useState("production-fleet-us");
  const [role, setRole] = useState("Cluster Admin");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const handleOperatorAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Set operator session cookie (valid 7 days)
    document.cookie = "hooksentry_operator=active; path=/; max-age=604800; SameSite=Lax";
    localStorage.setItem("hooksentry_operator_email", email.trim() || "operator@hooksentry.dev");
    localStorage.setItem("hooksentry_operator_role", role);
    localStorage.setItem("hooksentry_cluster_name", clusterName);

    setTimeout(() => {
      router.push("/endpoints");
      router.refresh();
    }, 400);
  };

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(
      `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...\nCLERK_SECRET_KEY=sk_test_...`
    );
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Background Subtle Technical Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Top Back Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Landing</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 mb-3 shadow-sm shadow-emerald-500/10">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            {mode === "sign-up" ? "Provision HookSentry Fleet" : "HookSentry Fleet Console"}
          </h1>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            {mode === "sign-up"
              ? "Create operator credentials to manage endpoints, mutation rules, and DLQ triage."
              : "Authenticate operator credentials to access cluster ingestion and DLQ triage."}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="w-full flex rounded-lg border border-white/[0.08] bg-zinc-900/80 p-1 mb-5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("operator")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition ${
              activeTab === "operator"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-white/[0.06]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dev Operator</span>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
              Ready
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clerk")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition ${
              activeTab === "clerk"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-white/[0.06]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
            <span>Clerk SSO</span>
          </button>
        </div>

        {/* Tab 1: Operator Dev Access */}
        {activeTab === "operator" && (
          <div className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                  {mode === "sign-up" ? "New Operator Registration" : "Operator Sign In"}
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Direct evaluation access with full Fleet Console permissions.
                </p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-zinc-800 text-zinc-400">
                <Shield className="h-3.5 w-3.5" />
              </div>
            </div>

            <form onSubmit={handleOperatorAuth} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                  Operator Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              {mode === "sign-up" && (
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                    Fleet Cluster Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    placeholder="us-east-prod-fleet"
                    className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                  Operator Role &amp; Permissions
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                >
                  <option value="Cluster Admin">
                    Cluster Admin (Full DLQ Replay &amp; Patch Permissions)
                  </option>
                  <option value="Site Reliability Engineer">
                    Site Reliability Engineer (Live Ingest &amp; Triage)
                  </option>
                  <option value="Security Auditor">Security Auditor (Read-Only Specs)</option>
                </select>
              </div>

              {/* Instant mode info callout */}
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-zinc-400 flex items-start gap-2.5">
                <span className="relative flex h-2 w-2 mt-1 shrink-0">
                  <span className="inline-flex h-full w-full rounded-full bg-emerald-400"></span>
                </span>
                <span>
                  Authorizes immediate entry into the Endpoints Hub, Live Ingestion Console, and DLQ Triage Engine.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="font-mono text-xs">Authenticating Session...</span>
                ) : (
                  <>
                    <span>Enter Fleet Console</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
              {mode === "sign-up" ? (
                <p className="text-xs text-zinc-400">
                  Already have an operator session?{" "}
                  <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                    Sign In
                  </Link>
                </p>
              ) : (
                <p className="text-xs text-zinc-400">
                  Need to provision a new cluster?{" "}
                  <Link href="/auth/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium">
                    Create Account
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Native Clerk SSO */}
        {activeTab === "clerk" && (
          <div className="w-full">
            {isPlaceholderKey ? (
              <div className="rounded-xl border border-white/[0.08] bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2.5 text-amber-400 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-semibold">Clerk API Keys Required for Live SSO</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  HookSentry has full Clerk Enterprise SSO pre-wired (OAuth, Google, GitHub, Magic Links).
                  However, <code className="text-zinc-300 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800">.env.local</code> currently contains a placeholder key.
                </p>

                <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Add to .env.local
                    </span>
                    <button
                      type="button"
                      onClick={copyEnvSnippet}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition"
                    >
                      {copiedEnv ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre overflow-x-auto">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <a
                    href="https://dashboard.clerk.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/[0.1] bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 transition"
                  >
                    <span>Open dashboard.clerk.com</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setActiveTab("operator")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Continue with Dev Operator Access</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                {mode === "sign-up" ? (
                  <SignUp
                    routing="path"
                    path="/auth/sign-up"
                    signInUrl="/auth/login"
                    fallbackRedirectUrl="/endpoints"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "bg-zinc-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-md rounded-xl p-6",
                        headerTitle: "text-zinc-100 font-semibold text-base",
                        headerSubtitle: "text-zinc-400 text-xs",
                        socialButtonsBlockButton:
                          "bg-zinc-950 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 text-xs",
                        dividerLine: "bg-zinc-800",
                        dividerText: "text-zinc-500 text-xs",
                        formFieldLabel: "text-zinc-300 text-xs font-mono",
                        formFieldInput:
                          "bg-zinc-950 border-zinc-800 text-zinc-100 text-xs rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
                        formButtonPrimary:
                          "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs rounded-md h-9 shadow-sm",
                        footerActionLink: "text-emerald-400 hover:text-emerald-300 text-xs",
                        footer: "border-t border-zinc-800/60 pt-4",
                      },
                    }}
                  />
                ) : (
                  <SignIn
                    routing="path"
                    path="/auth/login"
                    signUpUrl="/auth/sign-up"
                    fallbackRedirectUrl="/endpoints"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "bg-zinc-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-md rounded-xl p-6",
                        headerTitle: "text-zinc-100 font-semibold text-base",
                        headerSubtitle: "text-zinc-400 text-xs",
                        socialButtonsBlockButton:
                          "bg-zinc-950 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 text-xs",
                        dividerLine: "bg-zinc-800",
                        dividerText: "text-zinc-500 text-xs",
                        formFieldLabel: "text-zinc-300 text-xs font-mono",
                        formFieldInput:
                          "bg-zinc-950 border-zinc-800 text-zinc-100 text-xs rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
                        formButtonPrimary:
                          "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs rounded-md h-9 shadow-sm",
                        footerActionLink: "text-emerald-400 hover:text-emerald-300 text-xs",
                        footer: "border-t border-zinc-800/60 pt-4",
                      },
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
