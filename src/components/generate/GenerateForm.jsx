import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GenerateForm({
  appName,
  docsUrl,
  onAppNameChange,
  onDocsUrlChange,
  onSubmit,
  running,
  previewMode = false,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="app-name"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
          >
            App name
          </label>
          <Input
            id="app-name"
            value={appName}
            onChange={(event) => onAppNameChange(event.target.value)}
            placeholder="e.g. Linear, Airtable, Zendesk"
            disabled={running}
            className="mt-2 h-10"
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor="docs-url"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
          >
            Developer docs URL <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <Input
            id="docs-url"
            value={docsUrl}
            onChange={(event) => onDocsUrlChange(event.target.value)}
            placeholder="https://developers.example.com/oauth"
            disabled={running}
            className="mt-2 h-10"
            autoComplete="off"
          />
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {previewMode
          ? "Add a docs URL as a reference for yourself. This preview will not fetch or verify its contents."
          : "A docs URL sharpens the result when the app has several developer portals."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={running || !appName.trim()}>
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2} />
              Researching…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" strokeWidth={2} />
              {previewMode ? "Create draft guide" : "Research this app"}
            </>
          )}
        </Button>
        <p className="text-[11px] text-muted-foreground">
          {previewMode
            ? "Creates a generic checklist locally · not researched"
            : "Three live passes against the provider's docs · usually 30–60 seconds"}
        </p>
      </div>
    </form>
  );
}