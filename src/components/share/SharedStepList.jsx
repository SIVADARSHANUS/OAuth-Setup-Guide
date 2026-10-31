import React from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { StatusIcon } from "@/components/setup/ProgressHeader";
import { STATUS_LABELS } from "@/lib/progress";
import { cn } from "@/lib/utils";

export default function SharedStepList({ steps = [], progress = {} }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const entry = progress[step.step_id] || {};
        const status = entry.status || "not_started";

        return (
          <li key={step.step_id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <StatusIcon status={status} />
              <span className="uppercase tracking-[0.08em]">Step {index + 1}</span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" strokeWidth={1.75} />
                {step.active_minutes || 0} min
              </span>
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5",
                  status === "completed" && "bg-success-soft text-success",
                  status === "blocked" && "bg-blocked-soft text-blocked",
                  status !== "completed" && status !== "blocked" && "bg-secondary"
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>

            <h3 className="mt-2.5 font-heading text-base font-semibold leading-snug tracking-tight">
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.summary}</p>

            {step.instructions?.length > 0 && (
              <ul className="mt-3 space-y-2">
                {step.instructions.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand/60" />
                    {line}
                  </li>
                ))}
              </ul>
            )}

            {step.done_when && (
              <p className="mt-3 text-sm leading-relaxed">
                <span className="font-medium">Done when: </span>
                <span className="text-muted-foreground">{step.done_when}</span>
              </p>
            )}

            {status === "blocked" && entry.reason && (
              <p className="mt-3 rounded-lg border border-blocked/20 bg-blocked-soft p-3 text-sm leading-relaxed text-blocked">
                Blocker: {entry.reason}
              </p>
            )}

            {(step.portal_url || step.doc_url) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {step.portal_url && (
                  <a
                    href={step.portal_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                    Open {step.portal_label || "the console"}
                  </a>
                )}
                {step.doc_url && (
                  <a
                    href={step.doc_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                    {step.doc_label || "Documentation"}
                  </a>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}