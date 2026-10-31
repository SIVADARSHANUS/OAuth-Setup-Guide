import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle2, Circle, CircleDot, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProgressHeader({
  title,
  monogram,
  backTo,
  done,
  total,
  percent,
  blocked,
  actions,
}) {
  return (
    <div className="border-b border-border/70 bg-background">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to guide
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card font-heading text-[13px] font-semibold"
          >
            {monogram}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground">OAuth setup tracker</p>
          </div>
          {actions && <div className="ml-auto shrink-0">{actions}</div>}
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-foreground">
              {done} of {total} completed
            </span>
            <span className="text-muted-foreground">{percent}%</span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Setup progress"
          >
            <div
              className="h-full rounded-full bg-success transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          {blocked > 0 && (
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-blocked">
              <AlertCircle className="h-3 w-3" strokeWidth={2} />
              {blocked} step{blocked === 1 ? "" : "s"} blocked
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_ICON = {
  completed: { Icon: CheckCircle2, className: "text-success" },
  blocked: { Icon: AlertCircle, className: "text-blocked" },
  not_applicable: { Icon: MinusCircle, className: "text-muted-foreground" },
  in_progress: { Icon: CircleDot, className: "text-brand" },
  not_started: { Icon: Circle, className: "text-muted-foreground/50" },
};

export function StatusIcon({ status }) {
  const { Icon, className } = STATUS_ICON[status] || STATUS_ICON.not_started;
  return <Icon className={cn("h-4 w-4 shrink-0", className)} strokeWidth={2} />;
}