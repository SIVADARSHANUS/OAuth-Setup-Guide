import React from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-10 w-10 text-[13px]",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

export default function Monogram({ text, size = "md", className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-xl border border-border bg-secondary font-heading font-semibold tracking-tight text-foreground",
        SIZES[size],
        className
      )}
    >
      {text}
    </span>
  );
}