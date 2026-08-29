// ─────────────────────────────────────────────────────────────────────────
// Human Design chart engine — turns two sets of activations (Personality =
// birth moment, Design = 88° of solar arc earlier) into a full BodyGraph:
// active gates, formed channels, defined/open centers, Type, Strategy,
// Authority, Profile, Definition, Incarnation Cross, and signature themes.
// ─────────────────────────────────────────────────────────────────────────
import {
  CENTER_NAMES,
  CENTERS,
  MOTOR_CENTERS,
  GATE_TO_CENTER,
  CHANNELS,
  PROFILES,
  crossAngle,
  AUTHORITY_LABELS,
  TYPE_INFO,
  DEFINITION_INFO,
  type HdType,
  type AuthorityLabel,
  type TypeInfo,
} from "./hdData";
import { computeActivations, solveDesignTime, makeAstroTime, type Activations, type ActivationKey } from "./ephemeris";
import type { Astronomy } from "./ephemeris";

export { CENTERS, CHANNEL_BY_KEY, CHANNEL_KEY } from "./hdData";

const DEFINITION_BY_COUNT = ["None", "Single", "Split", "Triple Split", "Quadruple Split"];

export interface GateSideInfo {
  personality: boolean;
  design: boolean;
  lines: { personality?: number; design?: number };
  points: { side: "personality" | "design"; planet: ActivationKey; line: number }[];
}

function buildGateSideMap(personality: Activations, design: Activations): Record<number, GateSideInfo> {
  const map: Record<number, GateSideInfo> = {};
  for (const [key, act] of Object.entries(personality) as [ActivationKey, Activations[ActivationKey]][]) {
    const g = act.gate;
    (map[g] ??= { personality: false, design: false, lines: {}, points: [] });
    map[g].personality = true;
    map[g].lines.personality = act.line;
    map[g].points.push({ side: "personality", planet: key, line: act.line });
  }
  for (const [key, act] of Object.entries(design) as [ActivationKey, Activations[ActivationKey]][]) {
    const g = act.gate;
    (map[g] ??= { personality: false, design: false, lines: {}, points: [] });
    map[g].design = true;
    map[g].lines.design = act.line;
    map[g].points.push({ side: "design", planet: key, line: act.line });
  }
  return map;
}

export interface FormedChannel {
  gates: [number, number];
  name: string;
  centers: [string, string];
}

function formedChannels(activeGateSet: Set<number>): FormedChannel[] {
  const formed: FormedChannel[] = [];
  for (const [a, b, name] of CHANNELS) {
    if (activeGateSet.has(a) && activeGateSet.has(b)) {
      formed.push({ gates: [a, b], name, centers: [GATE_TO_CENTER[a], GATE_TO_CENTER[b]] });
    }
  }
  return formed;
}

function centerGraphAndDefinition(formed: FormedChannel[]) {
  const definedCenters = new Set<string>();
  const adjacency: Record<string, Set<string>> = Object.fromEntries(CENTER_NAMES.map((c) => [c, new Set<string>()]));
  for (const ch of formed) {
    const [c1, c2] = ch.centers;
    definedCenters.add(c1);
    definedCenters.add(c2);
    adjacency[c1].add(c2);
    adjacency[c2].add(c1);
  }
  return { definedCenters, adjacency };
}

function bfsReaches(
  adjacency: Record<string, Set<string>>,
  start: string,
  definedCenters: Set<string>,
  targetSet: Set<string>,
): boolean {
  if (!definedCenters.has(start)) return false;
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    if (targetSet.has(cur) && cur !== start) return true;
    for (const next of adjacency[cur]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return targetSet.has(start);
}

function connectedComponents(definedCenters: Set<string>, adjacency: Record<string, Set<string>>): Set<string>[] {
  const visited = new Set<string>();
  const components: Set<string>[] = [];
  for (const center of definedCenters) {
    if (visited.has(center)) continue;
    const comp = new Set<string>();
    const queue = [center];
    visited.add(center);
    while (queue.length) {
      const cur = queue.shift()!;
      comp.add(cur);
      for (const next of adjacency[cur]) {
        if (definedCenters.has(next) && !visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    components.push(comp);
  }
  return components;
}

function determineType(definedCenters: Set<string>, adjacency: Record<string, Set<string>>): HdType {
  if (definedCenters.size === 0) return "Reflector";
  const hasSacral = definedCenters.has("Sacral");
  const motorSet = new Set(MOTOR_CENTERS);
  const motorToThroat = bfsReaches(adjacency, "Throat", definedCenters, motorSet);
  if (hasSacral && motorToThroat) return "Manifesting Generator";
  if (hasSacral) return "Generator";
  if (motorToThroat) return "Manifestor";
  return "Projector";
}

function determineAuthority(
  definedCenters: Set<string>,
  adjacency: Record<string, Set<string>>,
): { key: string } & AuthorityLabel {
  if (definedCenters.size === 0) return { key: "Lunar", ...AUTHORITY_LABELS.Lunar };
  if (definedCenters.has("Solar Plexus"))
    return { key: "Solar Plexus", ...AUTHORITY_LABELS["Solar Plexus"] };
  if (definedCenters.has("Sacral")) return { key: "Sacral", ...AUTHORITY_LABELS.Sacral };
  if (definedCenters.has("Spleen")) return { key: "Spleen", ...AUTHORITY_LABELS.Spleen };
  if (definedCenters.has("Heart")) return { key: "Heart", ...AUTHORITY_LABELS.Heart };
  if (definedCenters.has("G") && bfsReaches(adjacency, "G", definedCenters, new Set(["Throat"]))) {
    return { key: "G Self-Projected", ...AUTHORITY_LABELS["G Self-Projected"] };
  }
  return { key: "Mental", ...AUTHORITY_LABELS.Mental };
}

export interface OpenCenterFlavor {
  kind: "completely-open" | "flavored";
  gates: number[];
}

export interface IncarnationCross {
  profile: string;
  profileName: string;
  angle: string;
  personalitySunGate: number;
  personalityEarthGate: number;
  designSunGate: number;
  designEarthGate: number;
  label: string;
}

export interface HdChart {
  personalityTime: Astronomy.AstroTime;
  designTime: Astronomy.AstroTime;
  personality: Activations;
  design: Activations;
  gateSides: Record<number, GateSideInfo>;
  activeGates: number[];
  formedChannels: FormedChannel[];
  definedCenters: string[];
  undefinedCenters: string[];
  openCenterFlavor: Record<string, OpenCenterFlavor>;
  definitionComponents: string[][];
  definition: string;
  definitionText: string;
  type: HdType;
  typeInfo: TypeInfo;
  authority: { key: string } & AuthorityLabel;
  profile: string;
  incarnationCross: IncarnationCross;
}

/** Full chart computation from a UTC birth instant. */
export function computeChartFromUtcParts(utcDate: Date): HdChart {
  const personalityTime = makeAstroTime(utcDate);
  const designTime = solveDesignTime(personalityTime);
  return computeChart(personalityTime, designTime);
}

export function computeChart(personalityTime: Astronomy.AstroTime, designTime: Astronomy.AstroTime): HdChart {
  const personality = computeActivations(personalityTime);
  const design = computeActivations(designTime);

  const gateSides = buildGateSideMap(personality, design);
  const activeGateSet = new Set(Object.keys(gateSides).map(Number));

  const formed = formedChannels(activeGateSet);
  const { definedCenters, adjacency } = centerGraphAndDefinition(formed);
  const undefinedCenters = CENTER_NAMES.filter((c) => !definedCenters.has(c));

  // For each open center: is it "completely open" (no active gate at all —
  // no filter whatsoever) or does it carry a "hanging gate" flavor (one or
  // more active gates present, just not their channel partner)?
  const openCenterFlavor: Record<string, OpenCenterFlavor> = {};
  for (const center of undefinedCenters) {
    const hangingGates = CENTERS[center].gates.filter((g) => activeGateSet.has(g));
    openCenterFlavor[center] =
      hangingGates.length === 0
        ? { kind: "completely-open", gates: [] }
        : { kind: "flavored", gates: hangingGates };
  }

  const type = determineType(definedCenters, adjacency);
  const authority = determineAuthority(definedCenters, adjacency);

  const components = connectedComponents(definedCenters, adjacency);
  const definitionLabel = DEFINITION_BY_COUNT[Math.min(components.length, 4)];

  const pSunLine = personality.Sun.line;
  const dSunLine = design.Sun.line;
  const profile = `${pSunLine}/${dSunLine}`;
  const angle = crossAngle(profile);

  const incarnationCross: IncarnationCross = {
    profile,
    profileName: PROFILES[profile] ?? "Unknown",
    angle,
    personalitySunGate: personality.Sun.gate,
    personalityEarthGate: personality.Earth.gate,
    designSunGate: design.Sun.gate,
    designEarthGate: design.Earth.gate,
    label: `${angle} Cross of Gates ${personality.Sun.gate}/${personality.Earth.gate} | ${design.Sun.gate}/${design.Earth.gate}`,
  };

  return {
    personalityTime,
    designTime,
    personality,
    design,
    gateSides,
    activeGates: [...activeGateSet].sort((a, b) => a - b),
    formedChannels: formed,
    definedCenters: [...definedCenters],
    undefinedCenters,
    openCenterFlavor,
    definitionComponents: components.map((c) => [...c]),
    definition: definitionLabel,
    definitionText: DEFINITION_INFO[definitionLabel],
    type,
    typeInfo: TYPE_INFO[type],
    authority,
    profile,
    incarnationCross,
  };
}
