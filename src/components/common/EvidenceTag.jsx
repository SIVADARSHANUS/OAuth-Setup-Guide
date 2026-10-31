import React from "react";
import { CheckCircle2, CircleDashed, FlaskConical, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { evidenceLabel } from "@/lib/format";

const CONFIG = {
  verified_in_docs: {
    Icon: CheckCircle2,
    className: "text-success",
  },
  tested: {
    Icon: FlaskConical,
    className: "text-brand",
  },
  estimate: {
    Icon: Gauge,
    className: "text-warning",
  },
  needs_confirmation: {
    Icon: CircleDashed,
    className: "text-muted-foreground",
  },
};

export default function EvidenceTag({ state, className }) {
  const config = CONFIG[state] || CONFIG.estimate;
  const Icon = config.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {evidenceLabel(state)}
    </span>
  );
}