import React from "react";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function SourceList({ sources = [] }) {
  return (
    <ul className="space-y-2.5">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex items-start gap-2 rounded-md text-sm font-medium leading-snug text-foreground underline-offset-4 hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ArrowUpRight
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-brand"
              strokeWidth={2}
            />
            <span className="min-w-0">{source.title}</span>
          </a>
          <p className="mt-1 pl-5 text-xs leading-relaxed text-muted-foreground">
            <span
              className={
                source.kind === "official"
                  ? "font-medium text-success"
                  : "font-medium text-muted-foreground"
              }
            >
              {source.kind === "official" ? "Official documentation" : "Community source"}
            </span>
            {source.retrieved_at ? ` · retrieved ${formatDate(source.retrieved_at)}` : ""}
            {source.supports ? ` · ${source.supports}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}