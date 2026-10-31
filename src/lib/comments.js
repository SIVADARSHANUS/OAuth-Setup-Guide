/**
 * Step notes are kept on this device, next to setup progress: they are working
 * notes about someone's own credentials, never sent to a server.
 */

const STORAGE_KEY = "oauth-copilot:comments:v1";

function keyFor(guideId, stepId) {
  return `${guideId}::${stepId}`;
}

function readStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage blocked — the note simply isn't kept.
  }
}

export function readStepComments(guideId, stepId) {
  if (!guideId || !stepId) return [];
  return readStore()[keyFor(guideId, stepId)] || [];
}

export function addStepComment(guideId, stepId, body) {
  const text = (body || "").trim();
  if (!text) return readStepComments(guideId, stepId);

  const store = readStore();
  const key = keyFor(guideId, stepId);
  const next = [
    ...(store[key] || []),
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      body: text,
      created_at: new Date().toISOString(),
    },
  ];
  store[key] = next;
  writeStore(store);
  return next;
}

export function deleteStepComment(guideId, stepId, commentId) {
  const store = readStore();
  const key = keyFor(guideId, stepId);
  const next = (store[key] || []).filter((comment) => comment.id !== commentId);
  if (next.length) store[key] = next;
  else delete store[key];
  writeStore(store);
  return next;
}

/** Used by the checklist rail to flag steps that already carry notes. */
export function countGuideComments(guideId) {
  if (!guideId) return 0;
  const prefix = `${guideId}::`;
  return Object.entries(readStore()).reduce(
    (total, [key, list]) => (key.startsWith(prefix) ? total + (list?.length || 0) : total),
    0
  );
}

export function clearGuideComments(guideId) {
  if (!guideId) return;
  const store = readStore();
  const prefix = `${guideId}::`;
  Object.keys(store).forEach((key) => {
    if (key.startsWith(prefix)) delete store[key];
  });
  writeStore(store);
}