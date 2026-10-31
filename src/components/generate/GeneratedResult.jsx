import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, RefreshCw, ShieldAlert } from "lucide-react";
import Monogram from "@/components/common/Monogram";
import DifficultyBadge from "@/components/common/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { effortRange } from "@/lib/format";

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function GeneratedResult({ guide, onReset }) {
  return (
    <div className="rounded-xl border border-success/30 bg-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <Monogram text={guide.monogram} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-semibold tracking-tight">{guide.app_name}</h2>
            <span
              className={
                guide.previewDraft
                  ? "rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.07em] text-foreground"
                  : "rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.07em] text-success"
              }
            >
              {guide.previewDraft ? "Draft preview" : "Generated"}
            </span>
            <DifficultyBadge level={guide.difficulty} />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{guide.tagline}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <Stat label="Recommended path" value={guide.path_label} />
        <Stat label="Active effort" value={effortRange(guide.active_effort_min, guide.active_effort_max)} />
        <Stat
          label="Steps"
          value={`${guide.steps.length} ${guide.previewDraft ? "sample" : "documented"}`}
        />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={1.75} />
        <p className="text-xs leading-relaxed text-foreground/90">
          {guide.previewDraft
            ? "Generic draft only — verify authentication, scopes, redirect URLs, and review requirements in the provider's official documentation."
            : guide.review_summary}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-3 w-3" strokeWidth={1.75} />
          {guide.sources.length} {guide.sources.length === 1 ? "source" : "sources"} cited
        </span>
        <span>{guide.external_wait_label}</span>
        <span>Saved in this browser only</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link to={`/apps/${guide.slug}`}>
            Open the guide
            <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/guides/${guide.id}/setup`}>Start setup</Link>
        </Button>
        <Button variant="ghost" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.75} />
          {guide.previewDraft ? "Create another draft" : "Research another app"}
        </Button>
      </div>
    </div>
  );
}