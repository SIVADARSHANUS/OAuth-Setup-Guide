import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import StartedGuideCard from "@/components/myguides/StartedGuideCard";
import GuidesSummary from "@/components/myguides/GuidesSummary";
import ShareDialog from "@/components/share/ShareDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGuideById } from "@/lib/guides";
import { deleteGeneratedGuide, listGeneratedGuides } from "@/lib/generatedGuides";
import { clearGuideComments } from "@/lib/comments";
import {
  clearGuideProgress,
  lastActivity,
  listTrackedGuideIds,
  progressStats,
  readGuideProgress,
} from "@/lib/progress";

export default function MyGuides() {
  const [rows, setRows] = useState(null);
  const [sharing, setSharing] = useState(null);

  const load = useCallback(async () => {
    const trackedIds = listTrackedGuideIds();
    const generated = listGeneratedGuides();
    const ids = Array.from(new Set([...trackedIds, ...generated.map((guide) => guide.id)]));
    const loaded = await Promise.all(ids.map((id) => getGuideById(id)));

    const next = loaded
      .filter(Boolean)
      .map((guide) => {
        const progress = readGuideProgress(guide.id);
        const stepIds = (guide.steps || []).map((step) => step.step_id);
        const steps = guide.steps || [];
        const spentMinutes = steps
          .filter((step) => progress[step.step_id]?.status === "completed")
          .reduce((sum, step) => sum + (step.active_minutes || 0), 0);
        const remainingMinutes = steps
          .filter((step) => progress[step.step_id]?.status !== "completed")
          .reduce((sum, step) => sum + (step.active_minutes || 0), 0);

        return {
          guide,
          progress,
          stats: progressStats(progress, stepIds),
          updated: lastActivity(progress),
          spentMinutes,
          remainingMinutes,
          tracked: trackedIds.includes(guide.id),
        };
      })
      .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));

    setRows(next);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reset = (guide) => {
    clearGuideProgress(guide.id);
    load();
  };

  const remove = (guide) => {
    deleteGeneratedGuide(guide.id);
    clearGuideProgress(guide.id);
    clearGuideComments(guide.id);
    load();
  };

  const summary = (rows || []).reduce(
    (acc, row) => {
      if (row.stats.percent === 100) acc.completedSetups += 1;
      else acc.inProgress += 1;
      acc.spentMinutes += row.spentMinutes;
      acc.remainingMinutes += row.remainingMinutes;
      return acc;
    },
    { inProgress: 0, completedSetups: 0, spentMinutes: 0, remainingMinutes: 0 }
  );

  return (
    <AppShell>
      <section className="border-b border-border/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 pb-8 pt-12 sm:px-8 sm:pt-14">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-brand">
              <span className="h-1 w-1 rounded-full bg-brand" />
              Your workspace
            </p>
            <h1 className="mt-3 font-heading text-[32px] font-semibold leading-[1.12] tracking-tight sm:text-[38px]">
              My guides
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Setups you've started and guides generated in this browser. Progress is stored on this
              device — share a link when someone else needs to see where you got to.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Browse library
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/generate">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Generate a guide
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {rows === null && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        )}

        {rows && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <p className="font-heading text-lg font-semibold tracking-tight">Nothing started yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Open a guide and mark a step to see it here. Generated guides are saved on this device
              automatically.
            </p>
            <Button asChild className="mt-5">
              <Link to="/">Find a guide</Link>
            </Button>
          </div>
        )}

        {rows && rows.length > 0 && (
          <>
            <GuidesSummary
              inProgress={summary.inProgress}
              completedSetups={summary.completedSetups}
              spentMinutes={summary.spentMinutes}
              remainingMinutes={summary.remainingMinutes}
            />

            <p className="mb-3 mt-8 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              All setups · {rows.length}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((row) => (
                <StartedGuideCard
                  key={row.guide.id}
                  guide={row.guide}
                  stats={row.stats}
                  updated={row.updated}
                  tracked={row.tracked}
                  onShare={() => setSharing(row)}
                  onReset={() => reset(row.guide)}
                  onDelete={() => remove(row.guide)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ShareDialog
        open={Boolean(sharing)}
        onOpenChange={(open) => !open && setSharing(null)}
        guide={sharing?.guide}
        progress={sharing?.progress}
      />
    </AppShell>
  );
}