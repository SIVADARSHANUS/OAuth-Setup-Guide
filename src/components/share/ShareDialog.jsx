import React, { useEffect, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createShare, shareUrl } from "@/lib/shares";

export default function ShareDialog({ open, onOpenChange, guide, progress }) {
  const [state, setState] = useState({ loading: false, url: "", error: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !guide) {
      setState({ loading: false, url: "", error: "" });
      setCopied(false);
      return undefined;
    }

    let active = true;
    setState({ loading: true, url: "", error: "" });
    createShare(guide, progress || {})
      .then((record) => {
        if (active) setState({ loading: false, url: shareUrl(record.id), error: "" });
      })
      .catch((err) => {
        if (active) {
          setState({
            loading: false,
            url: "",
            error: err?.message || "The link couldn't be created. Try again.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [open, guide, progress]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-tight">Share this setup path</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Anyone with the link sees {guide?.app_name || "this guide"} and the progress captured
            right now. It is read-only — their own tracker stays separate.
          </DialogDescription>
        </DialogHeader>

        {state.loading && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Creating the link…
          </div>
        )}

        {state.error && (
          <p className="rounded-lg border border-blocked/20 bg-blocked-soft px-3 py-3 text-sm leading-relaxed text-blocked">
            {state.error}
          </p>
        )}

        {state.url && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={state.url}
                aria-label="Shareable link"
                onFocus={(event) => event.target.select()}
                className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <Button size="sm" onClick={copy} className="shrink-0">
                {copied ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              The snapshot keeps the guide and progress exactly as they are now. Share again later
              for an updated link.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}