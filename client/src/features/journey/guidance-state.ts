import type { Journey } from "./types";

const KEY = "basis-journey-guidance";
const MAX_AGE = 12 * 60 * 60 * 1000;
export interface GuidanceState {
  version: 1;
  journeyId: string;
  datasetVersion: string;
  stepIds: string[];
  stepIndex: number;
  history: number[];
  active: boolean;
  completedAt: string | null;
  updatedAt: number;
}

// Only opaque identities and manual progress are retained. No provider routes,
// walking text, location coordinates, or location-history samples are stored.
export function loadGuidance(
  journey: Journey,
  datasetVersion: string,
): GuidanceState | null {
  try {
    const state = JSON.parse(localStorage.getItem(KEY) || "null");
    const stepIds = journey.steps?.map((s) => s.id) || [];
    if (
      !state ||
      state.version !== 1 ||
      state.journeyId !== journey.id ||
      state.datasetVersion !== datasetVersion ||
      !stepIds.length ||
      JSON.stringify(state.stepIds) !== JSON.stringify(stepIds) ||
      !Number.isInteger(state.stepIndex) ||
      state.stepIndex < 0 ||
      state.stepIndex >= stepIds.length ||
      typeof state.active !== "boolean" ||
      !Number.isFinite(state.updatedAt) ||
      state.updatedAt > Date.now() ||
      Date.now() - state.updatedAt > MAX_AGE ||
      !Array.isArray(state.history) ||
      state.history.length > 1000 ||
      state.history.some(
        (i: unknown) =>
          !Number.isInteger(i) || Number(i) < 0 || Number(i) >= stepIds.length,
      ) ||
      (state.completedAt !== null &&
        (typeof state.completedAt !== "string" ||
          !Number.isFinite(Date.parse(state.completedAt)) ||
          state.stepIndex !== stepIds.length - 1))
    )
      return null;
    return state;
  } catch {
    return null;
  }
}
export function saveGuidance(state: GuidanceState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function clearGuidance() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* Manual guidance still works. */
  }
}
