export function effortRange(min, max) {
  if (!min && !max) return "Unknown";
  if (!max || max === min) return `${min} min`;
  return `${min}–${max} min`;
}

export function formatDate(value) {
  if (!value) return "Not recorded";
  // Date-only strings are calendar dates, not instants — anchor at local noon so
  // they never drift a day across timezones.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return "0s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "app";
}

export const EVIDENCE_LABELS = {
  verified_in_docs: "Verified in docs",
  tested: "Tested",
  estimate: "Estimate",
  needs_confirmation: "Needs confirmation",
};

export function evidenceLabel(state) {
  return EVIDENCE_LABELS[state] || "Estimate";
}