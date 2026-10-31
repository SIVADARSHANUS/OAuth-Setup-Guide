import { upgradePreviewDraft } from "@/lib/previewGuides";

/**
 * Generated guides are stored in this browser only: they are produced live for
 * a single visitor, need no account, and never leave the device. Curated guides
 * live in the shared Guide entity and take precedence over local copies.
 */

const STORAGE_KEY = "oauth-copilot:generated:v1";
const MAX_GUIDES = 10;

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const upgraded = parsed.map(upgradePreviewDraft);
    if (upgraded.some((guide, index) => guide !== parsed[index])) {
      writeAll(upgraded);
    }
    return upgraded;
  } catch {
    return [];
  }
}

function writeAll(guides) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guides.slice(0, MAX_GUIDES)));
  } catch {
    // Storage full or blocked — the guide stays in memory for this session.
  }
}

export function generatedGuideId(slug) {
  return `gen_${slug}`;
}

export function listGeneratedGuides() {
  return readAll();
}

export function getGeneratedGuideById(id) {
  if (!id) return null;
  return readAll().find((guide) => guide.id === id) || null;
}

export function getGeneratedGuideBySlug(slug) {
  if (!slug) return null;
  return readAll().find((guide) => guide.slug === slug) || null;
}

export function saveGeneratedGuide(guide) {
  const record = {
    ...guide,
    id: generatedGuideId(guide.slug),
    origin: "generated",
    created_at: new Date().toISOString(),
  };
  const others = readAll().filter((item) => item.id !== record.id);
  writeAll([record, ...others]);
  return record;
}

export function deleteGeneratedGuide(id) {
  writeAll(readAll().filter((item) => item.id !== id));
}