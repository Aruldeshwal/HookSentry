"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Terminal } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { OperatorNavProfile } from "@/components/auth/OperatorNavProfile";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getOperatorSnapshot() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("hooksentry_operator=active");
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function NavBar() {
  const { isLoaded, isSignedIn } = useAuth();
  const isDevOperator = useSyncExternalStore(
    subscribe,
    getOperatorSnapshot,
    () => false
  );

  const isUserAuthenticated = (isLoaded && isSignedIn) || isDevOperator;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Status Indicator */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-100 transition hover:text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm tracking-tight text-zinc-100">
                HookSentry
              </span>
              <span className="rounded border border-zinc-800 bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
                v1.0
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] text-zinc-400">p99 &lt; 25ms</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
          <a
            href="#sandbox"
            className="transition hover:text-zinc-100"
          >
            Live Sandbox
          </a>
          <a
            href="#specs"
            className="transition hover:text-zinc-100"
          >
            Specs &amp; Benchmarks
          </a>
          <a
            href="#architecture"
            className="transition hover:text-zinc-100"
          >
            Architecture
          </a>
          <a
            href="#tiers"
            className="transition hover:text-zinc-100"
          >
            Tiers
          </a>
        </nav>

        {/* Right: GitHub & Live Console CTA */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Aruldeshwal/HookSentry"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Star</span>
            <span className="rounded bg-zinc-800 px-1 py-0.2 text-[10px] font-mono text-zinc-400">
              1.2k
            </span>
          </a>

          {/* Auth State Management */}
          {isUserAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/endpoints"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 hover:border-emerald-500/60"
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Fleet Console</span>
                <ArrowRight className="h-3 w-3 text-emerald-400" />
              </Link>
              <OperatorNavProfile showEmail={false} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-xs text-zinc-300 hover:text-white transition px-2.5 py-1.5"
              >
                Log In
              </Link>

              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3 w-3 text-zinc-950" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
