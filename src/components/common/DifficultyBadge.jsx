import React from "react";
import { cn } from "@/lib/utils";

const STYLES = {
  easy: "border-success/20 bg-success-soft text-success",
  medium: "border-warning/25 bg-warning-soft text-warning",
  advanced: "border-blocked/20 bg-blocked-soft text-blocked",
};

const LABELS = { easy: "Easy", medium: "Medium", advanced: "Advanced" };

export default function DifficultyBadge({ level, className }) {
  const key = STYLES[level] ? level : "medium";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        STYLES[key],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[key]}
    </span>
  );
}