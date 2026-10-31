import React from "react";
import DifficultyBadge from "@/components/common/DifficultyBadge";
import { formatDate } from "@/lib/format";

export default function GuideHeader({ guide }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-5">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 select-none items-center justify-center rounded-2xl border border-border bg-card font-heading text-lg font-semibold tracking-tight"
      >
        {guide.monogram || guide.app_name?.slice(0, 2)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-[34px]">
            {guide.app_name}
          </h1>
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {guide.domain}
          </span>
          {guide.status === "generated" && !guide.previewDraft && (
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
              Generated in this browser
            </span>
          )}
          {guide.previewOnly && (
            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-foreground">
              {guide.previewDraft ? "Draft preview · not researched" : "Preview example · not verified"}
            </span>
          )}
        </div>

        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {guide.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
          <DifficultyBadge level={guide.difficulty} />
          {guide.previewOnly ? (
            <span>Provider-specific steps not verified</span>
          ) : (
            <span>Last verified {formatDate(guide.last_verified)}</span>
          )}
          <span>Guide v{guide.version}</span>
          <span className="inline-flex items-center gap-1">
            Confidence
            <span className="font-medium text-foreground">{guide.confidence}</span>
          </span>
        </div>
      </div>
    </div>
  );
}