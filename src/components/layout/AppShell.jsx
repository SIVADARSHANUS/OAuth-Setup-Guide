import React from "react";
import { Link } from "react-router-dom";
import { KeyRound, Sparkles, FlaskConical } from "lucide-react";
import { isPreviewMode } from "@/lib/previewGuides";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <KeyRound className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="font-heading text-[15px] font-semibold tracking-tight">
              OAuth Setup Copilot
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Library
            </Link>
            <Link
              to="/my-guides"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              My Guides
            </Link>
            <Link
              to="/generate"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Generate
            </Link>
          </nav>
        </div>
      </header>

      {isPreviewMode && (
        <div className="border-b border-warning/30 bg-warning-soft px-5 py-2.5 text-center text-xs leading-relaxed text-foreground sm:px-8">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <FlaskConical className="h-3.5 w-3.5" strokeWidth={1.75} />
            Preview mode
          </span>
          <span className="ml-1.5">
            Sample guides demonstrate the workflow only; provider-specific steps are not verified.
          </span>
        </div>
      )}

      <main>{children}</main>

      <footer className="mt-24 border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{isPreviewMode
            ? "Preview content is illustrative and must be checked against current provider documentation."
            : "Guides are researched from provider documentation. Effort figures are estimates, never calendar time."}</p>
          <p className="shrink-0">OAuth Setup Copilot</p>
        </div>
      </footer>
    </div>
  );
}