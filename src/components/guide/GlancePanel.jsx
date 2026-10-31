import React from "react";
import { Clock, Hourglass, ShieldCheck, Signal } from "lucide-react";
import { effortRange } from "@/lib/format";

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm leading-relaxed text-foreground">{children}</div>
      </div>
    </div>
  );
}

export default function GlancePanel({ guide }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-sm font-semibold tracking-tight">Setup at a glance</h2>

      <div className="mt-4 divide-y divide-border/70">
        <Row icon={Clock} label="Active effort">
          <span className="font-medium">
            {effortRange(guide.active_effort_min, guide.active_effort_max)}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            Estimated time at the keyboard. Not calendar time.
          </span>
        </Row>

        <Row icon={Hourglass} label="External waiting">
          <span className="leading-relaxed">{guide.external_wait_label}</span>
        </Row>

        <Row icon={ShieldCheck} label="Review">
          <span className="leading-relaxed">{guide.review_summary}</span>
        </Row>

        <Row icon={Signal} label="Confidence">
          <span className="font-medium capitalize">
            {guide.previewOnly ? "Example only" : guide.confidence}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {guide.previewOnly
              ? "These sample steps have not been checked against provider documentation."
              : "Based on how directly the official documentation covers these steps."}
          </span>
        </Row>
      </div>
    </div>
  );
}