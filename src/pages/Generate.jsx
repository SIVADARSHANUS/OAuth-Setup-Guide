import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import GenerateForm from "@/components/generate/GenerateForm";
import StageTimeline from "@/components/generate/StageTimeline";
import ResearchDigest from "@/components/generate/ResearchDigest";
import GeneratedResult from "@/components/generate/GeneratedResult";
import RecentGenerates from "@/components/generate/RecentGenerates";
import { Button } from "@/components/ui/button";
import { GENERATION_STAGES, runGeneration } from "@/lib/generate";
import {
  deleteGeneratedGuide,
  listGeneratedGuides,
  saveGeneratedGuide,
} from "@/lib/generatedGuides";
import {
  createPreviewDraft,
  findPreviewGuideByName,
  isPreviewMode,
} from "@/lib/previewGuides";

const buildStages = () =>
  GENERATION_STAGES.map((stage) => ({
    ...stage,
    status: "pending",
    note: "",
    started_at: null,
    finished_at: null,
  }));

export default function Generate() {
  const [appName, setAppName] = useState(
    () => new URLSearchParams(window.location.search).get("app") || ""
  );
  const [docsUrl, setDocsUrl] = useState("");
  const [stages, setStages] = useState(buildStages);
  const [findings, setFindings] = useState({});
  const [guide, setGuide] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [recent, setRecent] = useState(() => listGeneratedGuides());
  const panelRef = useRef(null);

  const handleStage = useCallback(({ key, status, note }) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.key !== key
          ? stage
          : {
              ...stage,
              status,
              note: note ?? stage.note,
              started_at: status === "running" ? Date.now() : stage.started_at,
              finished_at: status === "done" || status === "failed" ? Date.now() : stage.finished_at,
            }
      )
    );
  }, []);

  const run = async () => {
    const name = appName.trim();
    if (!name || running) return;

    setStages(buildStages());
    setFindings({});
    setGuide(null);
    setDuplicate(null);
    setError(null);
    setRunning(true);

    try {
      if (isPreviewMode) {
        const sample = findPreviewGuideByName(name);
        const draft = sample || createPreviewDraft(name, docsUrl);
        const saved = saveGeneratedGuide(draft);
        setGuide(saved);
        setRecent(listGeneratedGuides());
        return;
      }

      const result = await runGeneration({
        appName: name,
        docsUrl: docsUrl.trim(),
        onStage: handleStage,
        onFindings: (patch) => setFindings((prev) => ({ ...prev, ...patch })),
      });
      setGuide(result.guide);
      setDuplicate(result.duplicate);
      setRecent(listGeneratedGuides());
    } catch (err) {
      setError(err?.message || "The research run stopped unexpectedly.");
      setStages((prev) =>
        prev.map((stage) =>
          stage.status === "running"
            ? { ...stage, status: "failed", finished_at: Date.now() }
            : stage
        )
      );
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setStages(buildStages());
    setFindings({});
    setGuide(null);
    setDuplicate(null);
    setError(null);
    setAppName("");
    setDocsUrl("");
  };

  const removeRecent = (id) => {
    deleteGeneratedGuide(id);
    setRecent(listGeneratedGuides());
  };

  const hasRun = Boolean(
    running ||
      (guide && !guide.previewOnly) ||
      error ||
      findings.identity ||
      (duplicate && !duplicate.previewOnly)
  );

  useEffect(() => {
    if (!guide && !duplicate && !error) return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [guide, duplicate, error]);

  return (
    <AppShell>
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-brand">
            <span className="h-1 w-1 rounded-full bg-brand" />
            {isPreviewMode ? "Research preview" : "Live research"}
          </p>
          <h1 className="mt-4 max-w-2xl font-heading text-[32px] font-semibold leading-[1.12] tracking-tight sm:text-[42px]">
            {isPreviewMode ? (
              <>
                No guide for your app?
                <span className="block text-muted-foreground">Draft a starter checklist.</span>
              </>
            ) : (
              <>
                No guide for your app?
                <span className="block text-muted-foreground">Research it in about a minute.</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {isPreviewMode
              ? "Create a generic OAuth setup checklist for any app and work through it locally. Provider-specific details are not researched in this preview."
              : "The same questions the curated guides answer — recommended path, prerequisites, honest effort, review requirements — answered from the provider's live documentation, with each claim labelled by how well it's evidenced."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8 sm:py-10">
        <GenerateForm
          appName={appName}
          docsUrl={docsUrl}
          onAppNameChange={setAppName}
          onDocsUrlChange={setDocsUrl}
          onSubmit={run}
          running={running}
          previewMode={isPreviewMode}
        />
        {isPreviewMode && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Try any app name to create a locally saved generic draft. Shopify, Slack, Google, and
            Notion also have sample guides. This preview does not research provider-specific details.
          </p>
        )}

        <div ref={panelRef} className="scroll-mt-20">
          {hasRun && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <StageTimeline stages={stages} />
              <ResearchDigest findings={findings} />
            </div>
          )}
        </div>

        {guide && <GeneratedResult guide={guide} onReset={reset} />}

        {duplicate && (
          <div className="rounded-xl border border-warning/30 bg-warning-soft p-5">
            <p className="font-heading text-sm font-semibold">
              {duplicate.previewOnly
                ? `${duplicate.app_name} preview example is ready`
                : `${duplicate.app_name} is already in the library`}
            </p>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-foreground/90">
              {duplicate.previewOnly
                ? "This frontend preview cannot run live research. Open the example guide to see the setup checklist; its provider-specific details are not verified."
                : "A curated guide already covers this app, and it's held to a higher bar than a single research pass. Open that one instead."}
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to={`/apps/${duplicate.slug}`}>Open the library guide</Link>
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-blocked/30 bg-blocked-soft p-5">
            <p className="flex items-center gap-2 font-heading text-sm font-semibold text-blocked">
              <AlertCircle className="h-4 w-4" strokeWidth={2} />
              The run stopped
            </p>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-foreground/90">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={run}
              disabled={running || !appName.trim()}
            >
              Try again
            </Button>
          </div>
        )}

        {recent.length > 0 && <RecentGenerates guides={recent} onRemove={removeRecent} />}
      </div>
    </AppShell>
  );
}