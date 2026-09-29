import Link from "next/link";
import { ShieldCheck } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-zinc-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand & MIT License */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 text-zinc-100 font-medium text-xs tracking-tight">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>HookSentry</span>
            </div>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="text-xs text-zinc-500 font-mono">
              Released under the <span className="text-zinc-400">MIT License</span>. Zero telemetry spying.
            </span>
          </div>

          {/* Links & Live Status */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <a
              href="https://github.com/Aruldeshwal/HookSentry"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-200 transition"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>

            <a
              href="#specs"
              className="hover:text-zinc-200 transition"
            >
              Specifications
            </a>

            <a
              href="#architecture"
              className="hover:text-zinc-200 transition"
            >
              Architecture
            </a>

            <Link
              href="/endpoints"
              className="hover:text-zinc-200 transition"
            >
              Console
            </Link>

            {/* Live Status Indicator */}
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
