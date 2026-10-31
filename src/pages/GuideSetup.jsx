import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, Share2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ShareDialog from "@/components/share/ShareDialog";
import ProgressHeader from "@/components/setup/ProgressHeader";
import StepRail from "@/components/setup/StepRail";
import StepPanel from "@/components/setup/StepPanel";
import StepComments from "@/components/setup/StepComments";
import BlockerDialog from "@/components/setup/BlockerDialog";
import NextActionPanel from "@/components/setup/NextActionPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGuideById } from "@/lib/guides";
import { isSettled, useGuideProgress } from "@/lib/progress";

export default function GuideSetup() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blockerOpen, setBlockerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getGuideById(id)
      .then((result) => {
        if (active) setGuide(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const steps = guide?.steps || [];
  const stepIds = useMemo(() => steps.map((step) => step.step_id), [steps]);
  const { progress, setStatus, done, blocked, total, percent } = useGuideProgress(
    guide?.id,
    stepIds
  );

  useEffect(() => {
    if (!steps.length) return;
    const firstOpen = steps.findIndex((step) => !isSettled(progress[step.step_id]?.status));
    setCurrentIndex(firstOpen === -1 ? 0 : firstOpen);
    // Only on first load of a guide
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.id, steps.length]);

  const goTo = (index) => {
    if (index < 0 || index >= steps.length) return;
    const step = steps[index];
    if (!progress[step.step_id]?.status) {
      setStatus(step.step_id, "in_progress");
    }
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="mt-4 h-6 w-64" />
          <Skeleton className="mt-4 h-1.5 w-full max-w-md" />
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!guide) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
          <p className="font-heading text-2xl font-semibold tracking-tight">Guide not found</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            This setup tracker doesn't exist, or the guide it belongs to was removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to the library</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const step = steps[currentIndex];
  const status = progress[step.step_id]?.status || "not_started";
  const reason = progress[step.step_id]?.reason || "";

  return (
    <AppShell>
      <ProgressHeader
        title={`${guide.app_name} OAuth setup`}
        monogram={guide.monogram}
        backTo={`/apps/${guide.slug}`}
        done={done}
        total={total}
        percent={percent}
        blocked={blocked}
        actions={
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
            Share progress
          </Button>
        }
      />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Setup checklist
            </p>
            <StepRail
              steps={steps}
              progress={progress}
              currentIndex={currentIndex}
              onSelect={goTo}
            />

            {blocked > 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-blocked/20 bg-blocked-soft p-3 text-xs leading-relaxed text-blocked lg:mt-4">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                A blocked step stops the integration from working. Clear it before you ship.
              </p>
            )}
          </aside>

          <div className="min-w-0 space-y-4">
            <StepPanel
              step={step}
              index={currentIndex}
              total={total}
              status={status}
              reason={reason}
              onToggleComplete={(checked) =>
                setStatus(step.step_id, checked ? "completed" : "not_started")
              }
              onBlock={() => setBlockerOpen(true)}
              onNotApplicable={() =>
                setStatus(
                  step.step_id,
                  status === "not_applicable" ? "not_started" : "not_applicable"
                )
              }
              onPrev={() => goTo(currentIndex - 1)}
              onNext={() => goTo(currentIndex + 1)}
            />

            <StepComments guideId={guide.id} stepId={step.step_id} />

            <NextActionPanel steps={steps} progress={progress} onSelect={goTo} />
          </div>
        </div>
      </div>

      <BlockerDialog
        open={blockerOpen}
        onOpenChange={setBlockerOpen}
        stepTitle={step.title}
        reason={reason}
        onSubmit={(value) => setStatus(step.step_id, "blocked", value)}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        guide={guide}
        progress={progress}
      />
    </AppShell>
  );
}