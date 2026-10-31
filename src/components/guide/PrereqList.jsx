import React from "react";
import { Check } from "lucide-react";
import EvidenceTag from "@/components/common/EvidenceTag";

export default function PrereqList({ items = [] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="flex gap-3">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-border bg-card">
            <Check className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug">{item.label}</p>
            {item.detail && (
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            )}
            <EvidenceTag state={item.evidence} className="mt-1" />
          </div>
        </li>
      ))}
    </ul>
  );
}