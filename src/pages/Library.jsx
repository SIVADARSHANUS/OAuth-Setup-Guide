import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, SearchX } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import SearchBar from "@/components/library/SearchBar";
import IntegrationCard from "@/components/library/IntegrationCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listGuides } from "@/lib/guides";
import { cn } from "@/lib/utils";
import { isPreviewMode } from "@/lib/previewGuides";

export default function Library() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const resultsRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    listGuides()
      .then((items) => {
        if (active) setGuides(items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((guide) =>
      [guide.app_name, guide.domain, guide.tagline, guide.path_label]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [guides, query]);

  const quickPicks = guides.slice(0, 4);
  const isSearching = query.trim().length > 0;

  return (
    <AppShell>
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-brand">
            <span className="h-1 w-1 rounded-full bg-brand" />
            OAuth research for agent builders
          </p>

          <h1 className="mt-4 max-w-3xl font-heading text-[34px] font-semibold leading-[1.1] tracking-tight sm:text-[46px]">
            Know exactly how to connect an app
            <span className="block text-muted-foreground">before you spend a day on it.</span>
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {isPreviewMode
              ? "Explore sample OAuth integrations, detailed setup checklists, and progress tracking. Preview steps are illustrative, not provider-verified."
              : "Recommended setup path, prerequisites, honest effort estimates, and what could block you — built from the provider's own documentation, with the evidence shown."}
          </p>

          <div className="mt-7">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={() =>
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              busy={loading}
            />
          </div>

          {quickPicks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Popular
              </span>
              {quickPicks.map((guide) => (
                <button
                  key={guide.slug}
                  type="button"
                  onClick={() => setQuery(guide.app_name)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    query === guide.app_name
                      ? "border-brand/35 bg-brand/10 text-brand"
                      : "border-border bg-card text-foreground/80 hover:border-brand/30 hover:text-foreground"
                  )}
                >
                  {guide.app_name}
                </button>
              ))}
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section
        ref={resultsRef}
        className="mx-auto max-w-6xl scroll-mt-20 px-5 py-10 sm:px-8 sm:py-12"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              {isSearching ? "Search results" : "Integration library"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? "Loading researched guides…"
                : `${filtered.length} ${filtered.length === 1 ? "guide" : "guides"}${
                    isSearching
                      ? ` for “${query.trim()}”`
                      : isPreviewMode
                        ? " · sample guides"
                        : " · sources cited, estimates labelled"
                  }`}
            </p>
          </div>
        </div>

        {loading && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="mt-4 h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1.5 h-3 w-2/3" />
                <Skeleton className="mt-6 h-3 w-28" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6">
            <AlertCircle className="h-5 w-5 text-blocked" strokeWidth={1.75} />
            <div>
              <p className="font-heading text-sm font-semibold">The library didn't load</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The guides are stored server-side. Check your connection and try again.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((guide) => (
              <IntegrationCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card/60 p-8">
            <SearchX className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <div>
              <p className="font-heading text-sm font-semibold">
                {isSearching
                  ? `No researched guide for “${query.trim()}” yet`
                  : "No guides in the library yet"}
              </p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                {isSearching
                  ? isPreviewMode
                    ? "This app isn't in the sample library. Create a generic draft checklist for it; provider-specific details won't be researched in preview mode."
                    : "The library covers four providers so far. You can research this one from its live documentation instead — it takes about a minute."
                  : "Curated guides are added from the provider's official documentation. Check back shortly."}
              </p>
            </div>
            {isSearching && (
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to={`/generate?app=${encodeURIComponent(query.trim())}`}>
                    Generate a guide for “{query.trim()}”
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}