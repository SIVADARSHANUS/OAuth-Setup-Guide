import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, ShieldAlert } from "lucide-react";
import Monogram from "@/components/common/Monogram";
import DifficultyBadge from "@/components/common/DifficultyBadge";
import { effortRange, formatDate } from "@/lib/format";

export default function IntegrationCard({ guide }) {
  return (
    <Link
      to={`/apps/${guide.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_10px_30px_-18px_rgba(33,29,26,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="flex items-start justify-between gap-3">
        <Monogram text={guide.monogram || guide.app_name?.slice(0, 2)} />
        <ArrowUpRight
          className="h-4 w-4 translate-y-0.5 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0 group-hover:text-brand"
          strokeWidth={1.75}
        />
      </div>

      <h3 className="mt-4 font-heading text-[15px] font-semibold tracking-tight text-foreground">
        {guide.app_name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {guide.tagline}
      </p>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {guide.path_label}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-[11px] text-muted-foreground">
        <DifficultyBadge level={guide.difficulty} />
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" strokeWidth={1.75} />
          {effortRange(guide.active_effort_min, guide.active_effort_max)}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <ShieldAlert className="mt-px h-3 w-3 shrink-0" strokeWidth={1.75} />
        <span className="line-clamp-2">{guide.review_summary}</span>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground/80">
        {guide.previewOnly ? "Illustrative preview · not verified" : `Verified ${formatDate(guide.last_verified)}`}
      </p>
    </Link>
  );
}