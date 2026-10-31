import { z } from "zod";
import { slugify } from "@/lib/format";

/**
 * Validation layer for generated guides.
 *
 * A generated guide is written by a language model from live documentation, so
 * every field is validated and normalised here before it ever reaches the UI.
 * Anything the model omits or mislabels falls back to a conservative value
 * ("needs_confirmation" evidence) instead of throwing.
 */

const evidence = z
  .enum(["verified_in_docs", "tested", "estimate", "needs_confirmation"])
  .catch("needs_confirmation");

const text = () => z.string().trim().catch("");
const count = () => z.coerce.number().catch(0);

export const PATH_LABELS = {
  custom_oauth_app: "Custom OAuth app",
  managed_oauth: "Managed OAuth",
  api_key: "API key",
  mixed: "Mixed auth",
};

const prereqSchema = z.object({
  label: text(),
  detail: text(),
  evidence,
});

const stepSchema = z.object({
  step_id: text(),
  title: text(),
  summary: text(),
  instructions: z.array(z.string()).catch([]),
  fields: z
    .array(z.object({ label: text(), hint: text() }))
    .catch([])
    .default([]),
  tips: z.array(z.string()).catch([]).default([]),
  active_minutes: count(),
  owner: z.enum(["developer", "agent"]).catch("developer"),
  done_when: text(),
  portal_label: text(),
  portal_url: text(),
  doc_label: text(),
  doc_url: text(),
});

const approvalSchema = z.object({
  title: text(),
  condition: text(),
  evidence,
});

const blockerSchema = z.object({
  title: text(),
  detail: text(),
  next_action: text(),
});

const sourceSchema = z.object({
  title: text(),
  url: text(),
  kind: z.enum(["official", "community"]).catch("official"),
  supports: text(),
});

const coverageAuditSchema = z.object({
  area: text(),
  status: z.enum(["covered", "not_applicable", "needs_confirmation"]).catch("needs_confirmation"),
  detail: text(),
  doc_url: text(),
});

const alternativeSchema = z.object({
  label: text(),
  note: text(),
});

const generatedGuideSchema = z.object({
  app_name: z.string().trim().min(1),
  slug: text(),
  domain: text(),
  docs_root_url: text(),
  monogram: text(),
  tagline: text(),
  description: text(),
  path_key: z
    .enum(["custom_oauth_app", "managed_oauth", "api_key", "mixed"])
    .catch("custom_oauth_app"),
  path_label: text(),
  path_reason: text(),
  alternatives: z.array(alternativeSchema).catch([]),
  confidence: z.enum(["high", "medium", "low"]).catch("medium"),
  active_effort_min: count(),
  active_effort_max: count(),
  external_wait_label: text(),
  review_required: z.boolean().catch(false),
  review_summary: text(),
  prerequisites: z.array(prereqSchema).catch([]),
  steps: z.array(stepSchema).catch([]),
  approvals: z.array(approvalSchema).catch([]),
  blockers: z.array(blockerSchema).catch([]),
  sources: z.array(sourceSchema).catch([]),
  coverage_audit: z.array(coverageAuditSchema).catch([]),
});

function monogramFrom(appName) {
  const first = appName.trim()[0] || "A";
  return first.toUpperCase();
}

function difficultyFrom(minutes) {
  if (minutes < 30) return "easy";
  if (minutes < 75) return "medium";
  return "advanced";
}

/**
 * Validates and normalises a composed guide. Throws a user-readable error when
 * the model produced nothing usable (no name, no steps).
 */
export function parseGeneratedGuide(raw) {
  let parsed;
  try {
    parsed = generatedGuideSchema.parse(raw ?? {});
  } catch {
    throw new Error(
      "The research pass came back in an unexpected shape. Try again — a second attempt usually lands."
    );
  }

  const steps = parsed.steps
    .filter((step) => step.title)
    .map((step, index) => ({
      ...step,
      step_id: step.step_id || `step_${index + 1}`,
    }));

  if (!steps.length) {
    throw new Error(
      "The research pass found no setup steps. Add the developer documentation URL and try again."
    );
  }

  const stepMinutes = steps.reduce((total, step) => total + (step.active_minutes || 0), 0);
  const min = Math.max(5, Math.round(parsed.active_effort_min || stepMinutes || 20));
  const max = Math.max(min + 5, Math.round(parsed.active_effort_max || min * 1.6));

  return {
    app_name: parsed.app_name,
    slug: parsed.slug || slugify(parsed.app_name),
    domain: parsed.domain,
    docs_root_url: parsed.docs_root_url,
    monogram: parsed.monogram || monogramFrom(parsed.app_name),
    tagline: parsed.tagline || `How to connect ${parsed.app_name} over OAuth.`,
    description: parsed.description || parsed.tagline,
    path_key: parsed.path_key,
    path_label: parsed.path_label || PATH_LABELS[parsed.path_key],
    path_reason: parsed.path_reason,
    alternatives: parsed.alternatives.filter((item) => item.label),
    difficulty: difficultyFrom(min),
    confidence: parsed.confidence,
    active_effort_min: min,
    active_effort_max: max,
    external_wait_label:
      parsed.external_wait_label ||
      (parsed.review_required ? "Provider review required" : "No provider review documented"),
    review_required: parsed.review_required,
    review_summary:
      parsed.review_summary || "The provider's review policy wasn't confirmed in the documentation.",
    prerequisites: parsed.prerequisites.filter((item) => item.label),
    steps,
    approvals: parsed.approvals.filter((item) => item.title),
    blockers: parsed.blockers.filter((item) => item.title),
    sources: parsed.sources.filter((item) => item.url),
    coverage_audit: parsed.coverage_audit.filter((item) => item.area),
    last_verified: new Date().toISOString().slice(0, 10),
    version: "1.0",
    status: "generated",
  };
}