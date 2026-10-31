import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS = {
  pending: { Icon: Circle, className: "text-muted-foreground/40" },
  running: { Icon: Loader2, className: "animate-spin text-brand" },
  done: { Icon: CheckCircle2, className: "text-success" },
  failed: { Icon: XCircle, className: "text-blocked" },
};

export default function StageTimeline({ stages }) {
  const running = stages.some((stage) => stage.status === "running");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Research passes
        </p>
        {running && <span className="text-[11px] text-brand">working…</span>}
      </div>

      <ol className="mt-4">
        {stages.map((stage, index) => {
          const config = STATUS[stage.status] || STATUS.pending;
          const Icon = config.Icon;
          const elapsed =
            stage.started_at && (stage.status === "done" || stage.status === "failed")
              ? stage.finished_at - stage.started_at
              : stage.status === "running"
                ? now - stage.started_at
                : 0;

          return (
            <li key={stage.key} className="relative flex gap-3 pb-4 last:pb-0">
              {index < stages.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[9px] top-5 h-full w-px bg-border"
                />
              )}
              <Icon
                className={cn("relative z-10 mt-0.5 h-[18px] w-[18px] shrink-0 bg-card", config.className)}
                strokeWidth={2}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      stage.status === "pending" ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {stage.label}
                  </p>
                  {elapsed > 0 && (
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {formatDuration(elapsed)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {stage.note || stage.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}