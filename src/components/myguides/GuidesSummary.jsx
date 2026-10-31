import React from "react";
import { Clock, ListChecks } from "lucide-react";

function formatMinutes(total) {
  const minutes = Math.max(0, Math.round(total || 0));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export default function GuidesSummary({ inProgress, completedSetups, spentMinutes, remainingMinutes }) {
  const stats = [
    {
      icon: ListChecks,
      label: "Setups in progress",
      value: inProgress,
      hint:
        completedSetups > 0
          ? `${completedSetups} finished · ${inProgress + completedSetups} in this browser`
          : "Open a guide and mark a step to start",
    },
    {
      icon: Clock,
      label: "Active time spent",
      value: formatMinutes(spentMinutes),
      hint:
        remainingMinutes > 0
          ? `Estimated from completed steps · about ${formatMinutes(remainingMinutes)} left`
          : "Estimated from completed steps",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stats.map(({ icon: Icon, label, value, hint }) => (
        <div key={label} className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-brand" strokeWidth={1.75} />
            {label}
          </p>
          <p className="mt-2 font-heading text-[28px] font-semibold leading-none tracking-tight">
            {value}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
        </div>
      ))}
    </div>
  );
}