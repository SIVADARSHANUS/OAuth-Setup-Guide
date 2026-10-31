import React from "react";
import { ArrowUpRight, CheckCircle2, CircleHelp, MinusCircle } from "lucide-react";

const STATUS = {
  covered: {
    label: "Covered",
    Icon: CheckCircle2,
    className: "text-success",
  },
  not_applicable: {
    label: "Not applicable",
    Icon: MinusCircle,
    className: "text-muted-foreground",
  },
  needs_confirmation: {
    label: "Needs confirmation",
    Icon: CircleHelp,
    className: "text-warning",
  },
};

export default function CoverageAudit({ items = [] }) {
  if (!items.length) {
    return (
      <p className="rounded-lg border border-warning/25 bg-warning-soft p-4 text-sm leading-relaxed text-foreground/90">
        This guide predates the coverage audit. Its setup details may be incomplete; verify each
        applicable area against current provider documentation.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        This checklist makes researched and unresolved areas visible; it is not a guarantee of
        completeness. Confirm requirements against the linked, current provider documentation.
      </p>
      <ul className="space-y-2">
        {items.map((item, index) => {
          const status = STATUS[item.status] || STATUS.needs_confirmation;
          const Icon = status.Icon;

          return (
            <li
              key={`${item.area}-${index}`}
              className="rounded-lg border border-border bg-card p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.area}</p>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${status.className}`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {status.label}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
              {item.doc_url && (
                <a
                  href={item.doc_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand underline-offset-4 hover:underline"
                >
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  Supporting documentation
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
