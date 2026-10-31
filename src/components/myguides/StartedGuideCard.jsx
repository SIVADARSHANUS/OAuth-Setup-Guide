import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, RotateCcw, Share2, Trash2 } from "lucide-react";
import Monogram from "@/components/common/Monogram";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default function StartedGuideCard({ guide, stats, updated, tracked, onShare, onReset, onDelete }) {
  const generated = guide.origin === "generated";

  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Monogram text={guide.monogram} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/apps/${guide.slug}`}
              className="font-heading text-base font-semibold tracking-tight underline-offset-4 hover:underline"
            >
              {guide.app_name}
            </Link>
            {generated && (
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success">
                Generated here
              </span>
            )}
            {stats.blocked > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blocked-soft px-2 py-0.5 text-[10px] font-medium text-blocked">
                <AlertCircle className="h-3 w-3" strokeWidth={2} />
                {stats.blocked} blocked
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {guide.path_label} · {stats.total} steps
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{stats.percent}%</span>
      </div>

      <div className="mt-4">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={stats.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${guide.app_name} setup progress`}
        >
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {stats.done} of {stats.total} completed
          {updated ? ` · updated ${formatDate(updated)}` : " · not started"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
        <Button asChild size="sm">
          <Link to={`/guides/${guide.id}/setup`}>
            {tracked ? "Resume" : "Start"}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </Button>
        <Button size="sm" variant="outline" onClick={onShare}>
          <Share2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
          Share
        </Button>
        {tracked && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={onReset}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
            Reset progress
          </Button>
        )}
        {generated && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-blocked"
            onClick={onDelete}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
            Delete
          </Button>
        )}
      </div>
    </article>
  );
}