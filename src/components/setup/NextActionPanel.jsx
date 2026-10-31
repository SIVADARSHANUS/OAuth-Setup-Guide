import React from "react";
import { ArrowRight, Compass } from "lucide-react";
import { isSettled } from "@/lib/progress";

export default function NextActionPanel({ steps = [], progress, onSelect }) {
  const nextIndex = steps.findIndex((step) => !isSettled(progress[step.step_id]?.status));
  const allDone = nextIndex === -1;
  const blockedCount = steps.filter((s) => progress[s.step_id]?.status === "blocked").length;

  if (allDone) {
    return (
      <div className="rounded-xl border border-success/20 bg-success-soft p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-success">
          Next action
        </p>
        <p className="mt-1 text-sm leading-relaxed">
          Every step is settled{blockedCount ? ` (${blockedCount} still blocked)` : ""}. Verify the
          connection end to end with a real request before you ship.
        </p>
      </div>
    );
  }

  const next = steps[nextIndex];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
        <Compass className="h-3 w-3" strokeWidth={2} />
        Next action
      </p>
      <button
        type="button"
        onClick={() => onSelect(nextIndex)}
        className="mt-1.5 flex w-full items-center justify-between gap-3 text-left text-sm font-medium leading-snug hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <span>
          {nextIndex + 1}. {next.title}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
      </button>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{next.summary}</p>
    </div>
  );
}