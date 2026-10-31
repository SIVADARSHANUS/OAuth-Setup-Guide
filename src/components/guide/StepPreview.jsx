import React from "react";
import { ArrowUpRight, Clock } from "lucide-react";

const OWNER_LABELS = {
  agent: "Agent-assisted",
  developer: "You do this",
};

export default function StepPreview({ steps = [] }) {
  return (
    <ol className="divide-y divide-border/70">
      {steps.map((step, index) => (
        <li key={step.step_id} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary font-mono text-[11px] font-medium text-muted-foreground">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">{step.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.summary}</p>
            {(step.instructions?.length > 0 || step.fields?.length > 0 || step.tips?.length > 0) && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-brand underline-offset-4 hover:underline">
                  View detailed instructions
                </summary>
                {step.instructions?.length > 0 && (
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                    {step.instructions.map((instruction, instructionIndex) => (
                      <li key={`${instructionIndex}-${instruction}`}>{instruction}</li>
                    ))}
                  </ol>
                )}
                {step.fields?.length > 0 && (
                  <dl className="mt-3 space-y-1.5 text-sm">
                    {step.fields.map((field) => (
                      <div key={field.label}>
                        <dt className="inline font-medium">{field.label}</dt>
                        <dd className="ml-1 inline text-muted-foreground">{field.hint}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {step.tips?.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {step.tips.map((tip, tipIndex) => (
                      <li key={`${tipIndex}-${tip}`}>{tip}</li>
                    ))}
                  </ul>
                )}
              </details>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" strokeWidth={1.75} />
                {step.active_minutes} min
              </span>
              <span
                className={
                  step.owner === "agent"
                    ? "rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand"
                    : "rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground"
                }
              >
                {OWNER_LABELS[step.owner] || OWNER_LABELS.developer}
              </span>
              {step.portal_url && (
                <a
                  href={step.portal_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-medium text-brand underline-offset-4 hover:underline"
                >
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  Open {step.portal_label || "console"}
                </a>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}