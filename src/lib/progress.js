import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "oauth-copilot:progress:v1";

export const STEP_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
  "not_applicable",
];

export const STATUS_LABELS = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  blocked: "Blocked",
  not_applicable: "Not applicable",
};

function readStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function readGuideProgress(guideId) {
  if (!guideId) return {};
  return readStore()[guideId] || {};
}

function writeGuideProgress(guideId, value) {
  const store = readStore();
  store[guideId] = value;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function isSettled(status) {
  return status === "completed" || status === "not_applicable";
}

/** Guide ids that have at least one step touched in this browser. */
export function listTrackedGuideIds() {
  return Object.entries(readStore())
    .filter(([, entries]) => entries && Object.keys(entries).length > 0)
    .map(([guideId]) => guideId);
}

export function clearGuideProgress(guideId) {
  const store = readStore();
  delete store[guideId];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage blocked — nothing else to do.
  }
}

export function progressStats(progress, stepIds = []) {
  const done = stepIds.filter((id) => isSettled(progress[id]?.status)).length;
  const blocked = stepIds.filter((id) => progress[id]?.status === "blocked").length;
  const total = stepIds.length;
  return { done, blocked, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Most recent step update, so a list can sort by what the user touched last. */
export function lastActivity(progress) {
  return Object.values(progress || {}).reduce(
    (latest, entry) => ((entry?.updated_at || "") > latest ? entry.updated_at : latest),
    ""
  );
}

export function useGuideProgress(guideId, stepIds = []) {
  const [progress, setProgress] = useState(() => readGuideProgress(guideId));

  useEffect(() => {
    setProgress(readGuideProgress(guideId));
  }, [guideId]);

  const setStatus = useCallback(
    (stepId, status, reason = "") => {
      setProgress((prev) => {
        const next = {
          ...prev,
          [stepId]: {
            status,
            reason,
            updated_at: new Date().toISOString(),
          },
        };
        writeGuideProgress(guideId, next);
        return next;
      });
    },
    [guideId]
  );

  const done = stepIds.filter((id) => isSettled(progress[id]?.status)).length;
  const blocked = stepIds.filter((id) => progress[id]?.status === "blocked").length;

  return {
    progress,
    setStatus,
    done,
    blocked,
    total: stepIds.length,
    percent: stepIds.length ? Math.round((done / stepIds.length) * 100) : 0,
  };
}