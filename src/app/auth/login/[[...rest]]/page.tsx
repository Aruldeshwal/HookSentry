import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operator Login — HookSentry",
  description: "Authenticate to access HookSentry Webhook Fleets and DLQ Console.",
};

export default function LoginPage() {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 mb-3 shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            HookSentry Console
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Distributed Webhook Ingestion &amp; DLQ Triage Engine
          </p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="w-full flex justify-center">
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
        </div>
      </div>
    </div>
  );
}
