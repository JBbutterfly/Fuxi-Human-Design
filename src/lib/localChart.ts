// Temporary stand-in for Firestore persistence while no Firebase project is
// wired up yet. Deliberately stores only the birth data (not the computed
// HdChart) — the chart engine's output holds AstroTime instances that don't
// round-trip through JSON, and recomputing from birth data is cheap and
// deterministic anyway. Swap this module for a Firestore-backed one once a
// project exists; nothing that calls it should need to change shape.
import { localToUtc } from "@/engine/geocode";
import type { BirthData } from "@/types";

const KEY = "fuxi:myChart";

export type ReadingDepth = "both" | "personality" | "design";

export interface LocalChartInput {
  subjectName: string;
  birthData: BirthData;
  readingDepth: ReadingDepth;
}

export function saveLocalChart(input: LocalChartInput) {
  window.localStorage.setItem(KEY, JSON.stringify(input));
}

export function loadLocalChart(): LocalChartInput | null {
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalChartInput;
  } catch {
    return null;
  }
}

export function clearLocalChart() {
  window.localStorage.removeItem(KEY);
}

/** Recovers the UTC birth instant from stored (date, time, timezone) strings. */
export function birthDataToUtcDate(birthData: BirthData): Date {
  const [year, month, day] = birthData.date.split("-").map(Number);
  const [hour, minute] = birthData.time.split(":").map(Number);
  return localToUtc({ year, month, day, hour, minute }, birthData.timezone).utcDate;
}
