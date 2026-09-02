"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SHIMMER_STYLE_ID = "an-bash-tool-shimmer-styles";
const SHIMMER_STYLES = `
@keyframes an-bash-shimmer {
  from { background-position: 100% center; }
  to { background-position: 0% center; }
}
.an-bash-shimmer {
  display: inline-block;
  background-size: 250% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(90deg, #a3a3a3 0%, #a3a3a3 40%, #525252 50%, #a3a3a3 60%, #a3a3a3 100%);
  background-repeat: no-repeat;
  animation: an-bash-shimmer 1.2s linear infinite;
}
@keyframes an-bash-dot {
  0%, 60%, 100% { opacity: 0.2; }
  30% { opacity: 1; }
}
.an-bash-dot { animation: an-bash-dot 1.4s infinite; }
`;

let shimmerStylesInjected = false;
function ensureShimmerStyles() {
  if (typeof document === "undefined") return;
  if (shimmerStylesInjected) return;
  if (document.getElementById(SHIMMER_STYLE_ID)) {
    shimmerStylesInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = SHIMMER_STYLE_ID;
  el.textContent = SHIMMER_STYLES;
  document.head.appendChild(el);
  shimmerStylesInjected = true;
}

function extractCommandSummary(cmd: string): string {
  return cmd
    .split("|")
    .map((s) => s.trim().split(/\s+/)[0] ?? "")
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
}

export type BashToolApproval = {
  pending?: boolean;
  onSkip?: () => void;
  onRun?: () => void;
  skipLabel?: string;
  runLabel?: string;
};

export type BashToolProps = {
  /** "running" shows shimmer header + spinner. "idle" shows static "Ran command:" header. */
  state?: "idle" | "running";
  /** Shell command (without the leading $). */
  command: string;
  /** Optional command output. Hidden while running. */
  output?: string;
  /** Optional approval footer. */
  approval?: BashToolApproval;
  className?: string;
};

function Spinner() {
  return (
    <svg
      className="w-3 h-3 text-neutral-500 dark:text-neutral-400 animate-spin shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="28"
        strokeDashoffset="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex" aria-hidden="true">
      <span className="an-bash-dot" style={{ animationDelay: "0.2s" }}>
        .
      </span>
      <span className="an-bash-dot" style={{ animationDelay: "0.4s" }}>
        .
      </span>
      <span className="an-bash-dot" style={{ animationDelay: "0.6s" }}>
        .
      </span>
    </span>
  );
}

function ApprovalFooter({
  isRunning,
  approval,
}: {
  isRunning: boolean;
  approval: BashToolApproval;
}) {
  const [decision, setDecision] = React.useState<"approved" | "rejected" | null>(null);

  const skipText = decision === "rejected" ? "Skipped" : (approval.skipLabel ?? "Skip");
  const runText = decision === "approved" ? "Approved" : (approval.runLabel ?? "Run");

  const status = React.useMemo(() => {
    if (decision === "approved") return { label: "Waiting", dots: true };
    if (decision === "rejected") return { label: "Canceled", dots: false };
    if (isRunning) return { label: "Starting", dots: true };
    return null;
  }, [decision, isRunning]);

  const handleSkip = () => {
    if (decision) return;
    setDecision("rejected");
    approval.onSkip?.();
  };
  const handleRun = () => {
    if (decision) return;
    setDecision("approved");
    approval.onRun?.();
  };

  return (
    <div className="flex items-center justify-between py-1 pl-3 pr-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
      {status ? (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {status.label}
          {status.dots && <LoadingDots />}
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={handleSkip}
          disabled={Boolean(decision)}
          className="h-5 px-1.5 rounded-[4px] text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 active:scale-[0.98] transition-[background-color,color,transform] duration-150 disabled:opacity-60 disabled:hover:bg-transparent disabled:active:scale-100"
        >
          {skipText}
        </button>
        <button
          type="button"
          onClick={handleRun}
          disabled={Boolean(decision)}
          className="h-5 px-1.5 rounded-[4px] text-xs font-medium bg-blue-500 dark:bg-blue-400 text-white dark:text-neutral-950 hover:bg-blue-500/90 dark:hover:bg-blue-400/90 active:scale-[0.98] transition-[background-color,transform] duration-150 disabled:opacity-60 disabled:active:scale-100"
        >
          {runText}
        </button>
      </div>
    </div>
  );
}

export const BashTool = React.memo(function BashTool({
  state = "idle",
  command,
  output,
  approval,
  className,
}: BashToolProps) {
  React.useEffect(() => {
    ensureShimmerStyles();
  }, []);

  const isRunning = state === "running";
  const summary = extractCommandSummary(command);

  return (
    <div
      className={cn(
        "rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between pl-2.5 pr-2 h-7">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {isRunning ? (
            <span className="an-bash-shimmer text-xs leading-none truncate">
              Running command: {summary}
            </span>
          ) : (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              Ran command: {summary}
            </span>
          )}
        </div>
        {isRunning && <Spinner />}
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 font-mono text-[12px] leading-[16px] overflow-hidden bg-white dark:bg-neutral-950">
        <div className="break-all">
          <span className="text-amber-600 dark:text-amber-400 select-none">
            ${" "}
          </span>
          <span className="text-neutral-900 dark:text-neutral-100">
            {command}
          </span>
        </div>
        {!isRunning && output && (
          <div className="mt-1 text-neutral-500 dark:text-neutral-400 whitespace-pre-line max-h-[80px] overflow-hidden">
            {output}
          </div>
        )}
      </div>
      {approval && <ApprovalFooter isRunning={isRunning} approval={approval} />}
    </div>
  );
});
