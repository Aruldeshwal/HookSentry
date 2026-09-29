"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { LogOut, Shield, ChevronDown } from "lucide-react";

interface OperatorNavProfileProps {
  showEmail?: boolean;
}

// Storage event listener for cross-tab and in-tab synchronization
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getOperatorActiveSnapshot() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("hooksentry_operator=active");
}

function getOperatorEmailSnapshot() {
  if (typeof window === "undefined") return "operator@hooksentry.dev";
  return localStorage.getItem("hooksentry_operator_email") || "operator@hooksentry.dev";
}

function getOperatorRoleSnapshot() {
  if (typeof window === "undefined") return "Cluster Admin";
  return localStorage.getItem("hooksentry_operator_role") || "Cluster Admin";
}

export function OperatorNavProfile({ showEmail = true }: OperatorNavProfileProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  const isDevOperator = useSyncExternalStore(
    subscribe,
    getOperatorActiveSnapshot,
    () => false
  );

  const operatorEmail = useSyncExternalStore(
    subscribe,
    getOperatorEmailSnapshot,
    () => "operator@hooksentry.dev"
  );

  const operatorRole = useSyncExternalStore(
    subscribe,
    getOperatorRoleSnapshot,
    () => "Cluster Admin"
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDevSignOut = () => {
    // Clear operator cookie and stored profile
    document.cookie = "hooksentry_operator=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    localStorage.removeItem("hooksentry_operator_email");
    localStorage.removeItem("hooksentry_operator_role");
    localStorage.removeItem("hooksentry_cluster_name");
    setIsDropdownOpen(false);

    // Dispatch synthetic storage event to notify all hooks in current tab
    window.dispatchEvent(new Event("storage"));

    router.push("/");
    router.refresh();
  };

  // 1. If native Clerk user is signed in, render Clerk UserButton
  if (isLoaded && isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-7 w-7 rounded-md border border-zinc-700",
          },
        }}
      />
    );
  }

  // 2. If Dev Operator session is active, render sleek operator profile pill
  if (isDevOperator) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-zinc-900/90 hover:bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 transition"
          title={`Signed in as ${operatorEmail}`}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
            <Shield className="h-3 w-3" />
          </div>
          {showEmail && (
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-mono text-[11px] font-medium text-zinc-200 leading-tight">
                {operatorEmail.length > 20 ? `${operatorEmail.slice(0, 18)}...` : operatorEmail}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono leading-none">
                {operatorRole}
              </span>
            </div>
          )}
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-56 rounded-lg border border-white/[0.08] bg-zinc-900 p-2 shadow-xl backdrop-blur-md z-50">
            <div className="border-b border-white/[0.06] pb-2 mb-2 px-2">
              <div className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                Operator Session
              </div>
              <div className="font-mono text-xs font-semibold text-zinc-200 truncate mt-0.5">
                {operatorEmail}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400">
                  {operatorRole}
                </span>
              </div>
            </div>

            <button
              onClick={handleDevSignOut}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Not signed in
  return null;
}
