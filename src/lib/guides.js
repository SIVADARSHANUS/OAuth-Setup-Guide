import { base44 } from "@/api/base44Client";
import {
  getGeneratedGuideById,
  getGeneratedGuideBySlug,
} from "@/lib/generatedGuides";
import {
  getPreviewGuideById,
  getPreviewGuideBySlug,
  isPreviewMode,
  PREVIEW_GUIDES,
} from "@/lib/previewGuides";

export async function listGuides() {
  if (isPreviewMode) return PREVIEW_GUIDES;
  const page = await base44.entities.Guide.filter(
    { status: "curated" },
    { sort: "popular_rank", limit: 50 }
  );
  return page.items ?? [];
}

export async function findCuratedBySlug(slug) {
  if (!slug) return null;
  if (isPreviewMode) return getPreviewGuideBySlug(slug);
  const page = await base44.entities.Guide.filter({ slug }, { limit: 1 });
  return page.items?.[0] ?? null;
}

/** Curated guides first, then guides generated in this browser. */
export async function getGuideById(id) {
  if (!id) return null;
  const local = getGeneratedGuideById(id);
  if (local) return local;
  if (isPreviewMode) return getPreviewGuideById(id);
  try {
    return await base44.entities.Guide.get(id);
  } catch {
    return null;
  }
}

export async function getGuideBySlug(slug) {
  const curated = await findCuratedBySlug(slug);
  return curated ?? getGeneratedGuideBySlug(slug);
}