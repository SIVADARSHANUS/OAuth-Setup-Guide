import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Hourglass,
  User,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { STATUS_LABELS } from "@/lib/progress";
import { cn } from "@/lib/utils";

export default function StepPanel({
  step,
  index,
  total,
  status,
  reason,
  onToggleComplete,
  onBlock,
  onNotApplicable,
  onPrev,
  onNext,
}) {
  const completed = status === "completed";
  const isBlocked = status === "blocked";
  const notApplicable = status === "not_applicable";

  return (
    <article className="rounded-xl border border-border bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="uppercase tracking-[0.08em]">
          Step {index + 1} of {total}
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" strokeWidth={1.75} />
          {step.active_minutes} min
        </span>
        <span className="text-border">·</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
            step.owner === "agent"
              ? "bg-brand/10 text-brand"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {step.owner === "agent" ? (
            <Wand2 className="h-3 w-3" strokeWidth={2} />
          ) : (
            <User className="h-3 w-3" strokeWidth={2} />
          )}
          {step.owner === "agent" ? "Agent-assisted" : "You do this"}
        </span>
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5",
            completed && "bg-success-soft text-success",
            isBlocked && "bg-blocked-soft text-blocked",
            notApplicable && "bg-secondary text-muted-foreground",
            !completed && !isBlocked && !notApplicable && "bg-secondary text-muted-foreground"
          )}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <h2
        className={cn(
          "mt-3 font-heading text-xl font-semibold leading-snug tracking-tight sm:text-[22px]",
          completed && "text-muted-foreground line-through decoration-1"
        )}
      >
        {step.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.summary}</p>

      {step.instructions?.length > 0 && (
        <ol className="mt-5 space-y-2.5">
          {step.instructions.map((line, lineIndex) => (
            <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold tabular-nums text-muted-foreground">
                {lineIndex + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
      )}

      {step.fields?.length > 0 && (
        <div className="mt-5 rounded-lg border border-border bg-secondary/40 p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Values you'll need
          </p>
          <dl className="mt-2 space-y-1.5">
            {step.fields.map((field) => (
              <div key={field.label} className="text-sm leading-relaxed">
                <dt className="inline font-medium text-foreground">{field.label}</dt>
                {field.hint && (
                  <dd className="ml-0 inline text-muted-foreground">
                    <span className="px-1.5 text-border">—</span>
                    {field.hint}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      )}

      {step.tips?.length > 0 && (
        <div className="mt-4 rounded-lg border border-warning/25 bg-warning-soft p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-warning">
            Watch out for
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {step.tips.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-warning/70" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.done_when && (
        <div className="mt-5 flex gap-2.5 rounded-lg border border-border bg-secondary/60 p-3.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              Done when
            </p>
            <p className="mt-0.5 text-sm leading-relaxed">{step.done_when}</p>
          </div>
        </div>
      )}

      {(step.portal_url || step.doc_url) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {step.portal_url && (
            <Button asChild size="sm">
              <a href={step.portal_url} target="_blank" rel="noreferrer noopener">
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                Open {step.portal_label || "the console"}
              </a>
            </Button>
          )}
          {step.doc_url && (
            <a
              href={step.doc_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              {step.doc_label || "Official documentation"}
            </a>
          )}
        </div>
      )}

      {isBlocked && reason && (
        <div className="mt-5 rounded-lg border border-blocked/20 bg-blocked-soft p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-blocked">
            Blocker recorded
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{reason}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor={`step-done-${step.step_id}`}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-accent/60"
          >
            <Checkbox
              id={`step-done-${step.step_id}`}
              checked={completed}
              onCheckedChange={(checked) => onToggleComplete(Boolean(checked))}
              className="data-[state=checked]:border-success data-[state=checked]:bg-success"
            />
            <span className="text-sm font-medium">
              {completed ? "Completed" : "Mark as completed"}
            </span>
          </label>

          {!notApplicable && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-blocked"
              onClick={onBlock}
            >
              <Hourglass className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
              {isBlocked ? "Edit blocker" : "Can't complete this"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onNotApplicable}
          >
            {notApplicable ? "Make applicable" : "Not applicable"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrev} disabled={index === 0}>
            Previous
          </Button>
          <Button size="sm" onClick={onNext} disabled={index === total - 1}>
            Next
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </article>
  );
}