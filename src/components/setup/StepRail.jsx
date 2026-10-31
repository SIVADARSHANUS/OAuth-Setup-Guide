import React from "react";
import { cn } from "@/lib/utils";
import { StatusIcon } from "@/components/setup/ProgressHeader";
import { STATUS_LABELS } from "@/lib/progress";

export default function StepRail({ steps = [], progress, currentIndex, onSelect }) {
  return (
    <nav aria-label="Setup steps">
      {/* Mobile: horizontal strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {steps.map((step, index) => {
          const status = progress[step.step_id]?.status || "not_started";
          const active = index === currentIndex;
          return (
            <button
              key={step.step_id}
              type="button"
              onClick={() => onSelect(index)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              <StatusIcon status={status} />
              <span>{index + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop: vertical rail */}
      <ol className="hidden space-y-0.5 lg:block">
        {steps.map((step, index) => {
          const status = progress[step.step_id]?.status || "not_started";
          const active = index === currentIndex;
          return (
            <li key={step.step_id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-brand/30 bg-brand/5"
                    : "border-transparent hover:bg-accent/60"
                )}
              >
                <span className="mt-px">
                  <StatusIcon status={status} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[13px] leading-snug",
                      status === "completed" && "text-muted-foreground line-through",
                      active ? "font-medium text-foreground" : "text-foreground/90"
                    )}
                  >
                    {index + 1}. {step.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {STATUS_LABELS[status]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}