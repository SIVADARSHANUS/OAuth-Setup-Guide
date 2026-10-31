import { base44 } from "@/api/base44Client";
import { isSettled } from "@/lib/progress";

/**
 * Sharing publishes a read-only snapshot of a guide plus the sharer's progress.
 * The snapshot is stored so the link keeps working even for guides that only
 * exist in the sharer's browser (generated guides).
 */

const SNAPSHOT_FIELDS = [
  "app_name",
  "slug",
  "domain",
  "docs_root_url",
  "monogram",
  "tagline",
  "description",
  "path_key",
  "path_label",
  "path_reason",
  "alternatives",
  "difficulty",
  "confidence",
  "active_effort_min",
  "active_effort_max",
  "external_wait_label",
  "review_required",
  "review_summary",
  "prerequisites",
  "steps",
  "approvals",
  "blockers",
  "sources",
  "last_verified",
  "version",
  "status",
];

function snapshot(guide) {
  return SNAPSHOT_FIELDS.reduce((copy, field) => {
    if (guide[field] !== undefined) copy[field] = guide[field];
    return copy;
  }, {});
}

export async function createShare(guide, progress = {}) {
  const stepIds = (guide.steps || []).map((step) => step.step_id);
  const done = stepIds.filter((id) => isSettled(progress[id]?.status)).length;

  return base44.entities.SharedGuide.create({
    app_name: guide.app_name,
    slug: guide.slug,
    guide: snapshot(guide),
    progress,
    steps_completed: done,
    steps_total: stepIds.length,
    shared_at: new Date().toISOString(),
  });
}

export async function getShare(id) {
  if (!id) return null;
  try {
    return await base44.entities.SharedGuide.get(id);
  } catch {
    return null;
  }
}

export function shareUrl(id) {
  return `${window.location.origin}/shared/${id}`;
}