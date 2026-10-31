import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Layers, Lock } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import SharedStepList from "@/components/share/SharedStepList";
import Monogram from "@/components/common/Monogram";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { effortRange, formatDate } from "@/lib/format";
import { saveGeneratedGuide } from "@/lib/generatedGuides";
import { progressStats } from "@/lib/progress";
import { getShare } from "@/lib/shares";

export default function SharedGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getShare(id)
      .then((result) => {
        if (active) setShare(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (loading || share) return undefined;
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [loading, share]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-6 h-8 w-56" />
          <Skeleton className="mt-4 h-1.5 w-full max-w-sm" />
          <Skeleton className="mt-10 h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!share) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
          <p className="font-heading text-2xl font-semibold tracking-tight">Link unavailable</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            This shared guide was removed, or the link is incomplete. Ask the sender for a fresh one.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Browse the library</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const guide = share.guide || {};
  const steps = guide.steps || [];
  const stats = progressStats(
    share.progress || {},
    steps.map((step) => step.step_id)
  );

  const adopt = () => {
    const record = saveGeneratedGuide({
      ...guide,
      slug: guide.slug || share.slug,
      status: "generated",
    });
    navigate(`/guides/${record.id}/setup`);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 pt-8 sm:px-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Lock className="h-3 w-3" strokeWidth={2} />
          Shared read-only snapshot · {formatDate(share.shared_at)}
        </p>

        <div className="mt-5 flex items-start gap-4">
          <Monogram text={guide.monogram || share.app_name?.[0]} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {guide.app_name || share.app_name}
            </h1>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
              {guide.description || guide.tagline || "OAuth setup path"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-brand" strokeWidth={1.75} />
            {guide.path_label || "Setup path"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
            {effortRange(guide.active_effort_min, guide.active_effort_max)} of active work
          </span>
          {guide.last_verified && <span>Verified {formatDate(guide.last_verified)}</span>}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium">
              {stats.done} of {stats.total} steps completed when shared
            </span>
            <span className="text-muted-foreground">{stats.percent}%</span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={stats.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Shared progress"
          >
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
          {stats.blocked > 0 && (
            <p className="mt-2 text-[11px] font-medium text-blocked">
              {stats.blocked} step{stats.blocked === 1 ? "" : "s"} blocked at the time of sharing
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <h2 className="mb-3 font-heading text-base font-semibold tracking-tight">
          The setup path
        </h2>
        <SharedStepList steps={steps} progress={share.progress || {}} />

        <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-border bg-secondary/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This snapshot doesn't change. Start your own tracker to work through it.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Library
              </Link>
            </Button>
            <Button size="sm" onClick={adopt}>
              Save to my guides
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}