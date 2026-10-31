import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clock,
  Layers,
  Share2,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import GuideHeader from "@/components/guide/GuideHeader";
import GlancePanel from "@/components/guide/GlancePanel";
import PrereqList from "@/components/guide/PrereqList";
import StepPreview from "@/components/guide/StepPreview";
import CoverageAudit from "@/components/guide/CoverageAudit";
import SourceList from "@/components/guide/SourceList";
import ShareDialog from "@/components/share/ShareDialog";
import EvidenceTag from "@/components/common/EvidenceTag";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGuideBySlug } from "@/lib/guides";
import { effortRange } from "@/lib/format";

// Stable reference: the overview shares the path only, never step progress.
const NO_PROGRESS = {};

function Section({ id, title, hint, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/70 pt-7 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function GuideOverview() {
  const { slug } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getGuideBySlug(slug)
      .then((result) => {
        if (active) setGuide(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (loading || guide) return undefined;
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [loading, guide]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="mt-5 h-8 w-56" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!guide) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
          <p className="font-heading text-2xl font-semibold tracking-tight">
            No guide for “{slug}”
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            This integration isn't in the library. Browse the guides that have been researched
            against official documentation.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to the library</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-4 pt-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Library
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-foreground">{guide.app_name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="border-b border-border/70 pb-8">
          <GuideHeader guide={guide} />
        </div>

        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div className="min-w-0 space-y-7">
            <Section id="path" title="Recommended path">
              <div className="rounded-xl border border-brand/20 bg-brand-soft/60 p-5">
                {guide.previewOnly && (
                  <p className="mb-3 rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs leading-relaxed text-foreground">
                    Preview example: these generic steps show the workflow, not verified
                    {` ${guide.app_name} `}requirements. Check the linked official documentation before implementing.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Layers className="h-4 w-4 text-brand" strokeWidth={1.75} />
                  <p className="font-heading text-sm font-semibold tracking-tight text-brand">
                    {guide.path_label}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  {guide.path_reason}
                </p>

                {guide.alternatives?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-brand/15 pt-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
                      Other documented paths
                    </p>
                    {guide.alternatives.map((alt) => (
                      <div key={alt.label} className="text-sm leading-relaxed">
                        <span className="font-medium">{alt.label}</span>
                        <span className="text-muted-foreground"> — {alt.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <Section id="prerequisites" title="Prerequisites" hint="Have these ready before you start">
              <PrereqList items={guide.prerequisites} />
            </Section>

            <Section
              id="steps"
              title="What you'll do"
              hint={`${guide.steps?.length || 0} steps · ${effortRange(
                guide.active_effort_min,
                guide.active_effort_max
              )} of active work`}
            >
              <StepPreview steps={guide.steps} />
            </Section>

            <Section
              id="coverage"
              title="Integration coverage check"
              hint={guide.coverage_audit?.length ? `${guide.coverage_audit.length} areas assessed` : "Not available"}
            >
              <CoverageAudit items={guide.coverage_audit} />
            </Section>

            <Section
              id="approval"
              title="Approval requirements"
              hint={guide.previewOnly ? "Not checked in preview mode" : "Conditional — read the trigger"}
            >
              {(guide.approvals || []).length > 0 ? (
                <ul className="space-y-3">
                  {(guide.approvals || []).map((approval) => (
                    <li key={approval.title} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <ShieldCheck className="h-4 w-4 text-brand" strokeWidth={1.75} />
                          {approval.title}
                        </p>
                        <EvidenceTag state={approval.evidence} />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {approval.condition}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {guide.previewOnly
                    ? "Approval and publishing requirements have not been checked. Confirm them in the provider's current documentation."
                    : "No approval requirement was documented in the sources found. Confirm it with the provider before you rely on it."}
                </p>
              )}
            </Section>

            <Section id="blockers" title="Known blockers" hint="What trips people up">
              {(guide.blockers || []).length > 0 ? (
                <ul className="space-y-3">
                  {(guide.blockers || []).map((blocker) => (
                    <li key={blocker.title} className="rounded-xl border border-border bg-card p-4">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 text-warning" strokeWidth={1.75} />
                        {blocker.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {blocker.detail}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">
                        <span className="font-medium">Next: </span>
                        {blocker.next_action}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {guide.previewOnly
                    ? "Potential blockers have not been checked in this preview."
                    : "No blockers were documented in the sources found — treat that as unconfirmed, not as a clean run."}
                </p>
              )}
            </Section>

            <Section
              id="sources"
              title="Sources"
              hint={guide.previewOnly ? "Official starting point; steps are not verified" : "Every claim traces back here"}
            >
              <SourceList sources={guide.sources} />
              <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-3.5 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">How to read the evidence.</span>{" "}
                “Verified in docs” means the provider states it in the linked page. “Estimate” means
                we inferred it from the described work. “Needs confirmation” means the provider
                doesn't document it clearly — treat it as open until you confirm it yourself.
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:row-start-1 lg:self-start">
            <GlancePanel guide={guide} />

            <div className="mt-4 space-y-2">
              <Button asChild className="w-full">
                <Link to={`/guides/${guide.id}/setup`}>
                  Start setup
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShareOpen(true)}>
                <Share2 className="mr-2 h-3.5 w-3.5" strokeWidth={2} />
                Share this path
              </Button>
              <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
                Progress is saved in this browser. You can resume any time.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
                Before you commit
              </p>
              <p className="mt-1.5 flex items-start gap-2 text-sm leading-relaxed">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span>{guide.external_wait_label}</span>
              </p>
            </div>
          </aside>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        guide={guide}
        progress={NO_PROGRESS}
      />
    </AppShell>
  );
}