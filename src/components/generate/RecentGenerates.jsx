import React from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Monogram from "@/components/common/Monogram";
import { Button } from "@/components/ui/button";
import { effortRange } from "@/lib/format";

export default function RecentGenerates({ guides, onRemove }) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-base font-semibold tracking-tight">
          Generated in this browser
        </h2>
        <p className="text-[11px] text-muted-foreground">Stored locally — never shared</p>
      </div>

      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {guides.map((guide) => (
          <li key={guide.id} className="flex items-center gap-3 px-4 py-3">
            <Monogram text={guide.monogram} size="sm" />
            <Link
              to={`/apps/${guide.slug}`}
              className="min-w-0 flex-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <p className="truncate font-heading text-sm font-semibold tracking-tight">
                {guide.app_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {guide.path_label} · {guide.steps?.length || 0} steps ·{" "}
                {effortRange(guide.active_effort_min, guide.active_effort_max)}
              </p>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${guide.app_name}`}
              onClick={() => onRemove(guide.id)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}