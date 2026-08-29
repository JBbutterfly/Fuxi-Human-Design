// ─────────────────────────────────────────────────────────────────────────
// BodyGraph SVG renderer. Draws the classic 9-center Human Design shape:
// centers positioned in their standard relative layout (Head/Ajna/Throat/
// G/Heart/Spleen-SolarPlexus/Sacral/Root), gate numbers distributed along
// each center's outer edge, and formed channels drawn as lines connecting
// the exact two gate points that complete them.
//
// This is a from-scratch layout (not traced from any proprietary chart) —
// visually in the standard BodyGraph arrangement, but the gate positions
// along each center's edge are evenly distributed rather than hand-tuned
// to match any particular commercial software pixel-for-pixel. The DATA
// (which gates belong to which center, which channels connect them) is
// exact; only the cosmetic micro-positioning of gate dots within a center
// is a clean approximation.
//
// Colors are Fuxi's own (not reused from any reference source) and are
// passed in as a theme, so the palette can change without touching layout.
// ─────────────────────────────────────────────────────────────────────────
import { CENTERS } from "@/engine/hdData";
import type { HdChart } from "@/engine/hdEngine";

const W = 460;
const H = 700;

interface CenterLayout {
  poly: [number, number][];
  labelEdge: [[number, number], [number, number]];
  centroid: [number, number];
}

// Each center: shape polygon points (for fill), and a "label edge" — the
// two endpoints along which its gates are evenly distributed as dots.
const LAYOUT: Record<string, CenterLayout> = {
  Head: {
    poly: [[230, 26], [270, 96], [190, 96]],
    labelEdge: [[196, 90], [264, 90]],
    centroid: [230, 73],
  },
  Ajna: {
    poly: [[230, 176], [190, 106], [270, 106]],
    labelEdge: [[264, 112], [196, 112]],
    centroid: [230, 129],
  },
  Throat: {
    poly: [[160, 196], [300, 196], [300, 286], [160, 286]],
    labelEdge: [[168, 202], [292, 202]],
    centroid: [230, 241],
  },
  G: {
    poly: [[230, 306], [300, 376], [230, 446], [160, 376]],
    labelEdge: [[172, 364], [288, 364]],
    centroid: [230, 376],
  },
  Heart: {
    poly: [[318, 350], [366, 376], [318, 402]],
    labelEdge: [[326, 358], [326, 394]],
    centroid: [335, 376],
  },
  Spleen: {
    poly: [[70, 420], [140, 456], [70, 522]],
    labelEdge: [[80, 434], [80, 508]],
    centroid: [93, 466],
  },
  "Solar Plexus": {
    poly: [[390, 420], [320, 456], [390, 522]],
    labelEdge: [[380, 434], [380, 508]],
    centroid: [367, 466],
  },
  Sacral: {
    poly: [[168, 466], [292, 466], [292, 546], [168, 546]],
    labelEdge: [[176, 472], [284, 472]],
    centroid: [230, 506],
  },
  Root: {
    poly: [[168, 576], [292, 576], [292, 656], [168, 656]],
    labelEdge: [[176, 582], [284, 582]],
    centroid: [230, 616],
  },
};

export interface BodyGraphTheme {
  centerDefined: string;
  centerUndefined: string;
  centerStroke: string;
  personality: string;
  design: string;
  both: string;
  undefinedGate: string;
  silhouetteFill: string;
  silhouetteStroke: string;
  wiringStroke: string;
}

// Fuxi's brand palette (Aged Gold / Deep Jade / Obsidian, from the design
// system) — kept as literal hex here rather than referencing the app's CSS
// custom properties, since this SVG string can be rendered into contexts
// (PDF export, off-screen nodes) that don't inherit page-level CSS variables.
// Keep in sync with src/app/globals.css if the palette changes.
export const DEFAULT_THEME: BodyGraphTheme = {
  centerDefined: "#C9962C", // gold-500 (--accent) — the "on"/defined color
  centerUndefined: "#1A1D21", // ink-700 — receded/open
  centerStroke: "rgba(255,255,255,.28)",
  personality: "#F6F2E8", // parchment-50 — conscious activations
  design: "#2E8069", // jade-400 — unconscious activations
  both: "#E0C079", // gold-300 — activated on both sides
  undefinedGate: "#2E3339", // ink-500
  silhouetteFill: "rgba(255,255,255,.06)",
  silhouetteStroke: "rgba(255,255,255,.12)",
  wiringStroke: "rgba(255,255,255,.10)",
};

function lerp([x1, y1]: [number, number], [x2, y2]: [number, number], t: number): [number, number] {
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

// ── Decorative background: a soft body silhouette + nested "wiring" loops,
// sitting behind the centers/channels so the graph reads as a figure rather
// than shapes floating in space. Hand-drawn, not traced from any source.
const SILHOUETTE_POINTS: [number, number][] = [
  [230, 14], [272, 60], [300, 118], [360, 200], [430, 400], [350, 560],
  [300, 650], [260, 686], [230, 694], [200, 686], [160, 650], [110, 560],
  [30, 400], [100, 200], [160, 118], [188, 60],
];

function mid([x1, y1]: [number, number], [x2, y2]: [number, number]): [number, number] {
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

// Smooth closed path through a ring of points, rounding every corner.
function smoothClosedPath(points: [number, number][]): string {
  const n = points.length;
  const start = mid(points[n - 1], points[0]);
  let d = `M ${start[0]},${start[1]} `;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const next = points[(i + 1) % n];
    const m = mid(p, next);
    d += `Q ${p[0]},${p[1]} ${m[0]},${m[1]} `;
  }
  return d + "Z";
}

const SILHOUETTE_PATH = smoothClosedPath(SILHOUETTE_POINTS);

const WIRING_CENTER: [number, number] = [230, 380];
const WIRING_RADII: [number, number][] = [
  [60, 69],
  [110, 126],
  [160, 184],
  [205, 236],
  [245, 278],
];

function renderBackgroundWiring(theme: BodyGraphTheme): string {
  const ellipses = WIRING_RADII.map(
    ([rx, ry]) =>
      `<ellipse cx="${WIRING_CENTER[0]}" cy="${WIRING_CENTER[1]}" rx="${rx}" ry="${ry}" fill="none" stroke="${theme.wiringStroke}" stroke-width="1.25" />`,
  ).join("\n");
  return `<path d="${SILHOUETTE_PATH}" fill="${theme.silhouetteFill}" stroke="${theme.silhouetteStroke}" stroke-width="1.5" />\n${ellipses}`;
}

interface GatePoint {
  x: number;
  y: number;
  center: string;
}

function gatePointsForCenter(centerName: string): Record<number, GatePoint> {
  const gates = [...CENTERS[centerName].gates].sort((a, b) => a - b);
  const [p1, p2] = LAYOUT[centerName].labelEdge;
  const n = gates.length;
  const points: Record<number, GatePoint> = {};
  gates.forEach((g, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const [x, y] = lerp(p1, p2, t);
    points[g] = { x, y, center: centerName };
  });
  return points;
}

export function computeGatePositions(): Record<number, GatePoint> {
  const all: Record<number, GatePoint> = {};
  for (const center of Object.keys(CENTERS)) {
    Object.assign(all, gatePointsForCenter(center));
  }
  return all;
}

function polyPoints(pts: [number, number][]): string {
  return pts.map((p) => p.join(",")).join(" ");
}

type GateSide = "both" | "personality" | "design" | null;

function gateSide(chart: HdChart, gate: number): GateSide {
  const g = chart.gateSides[gate];
  if (!g) return null;
  if (g.personality && g.design) return "both";
  if (g.personality) return "personality";
  return "design";
}

function sideColor(side: GateSide, theme: BodyGraphTheme): string {
  if (side === "both") return theme.both;
  if (side === "design") return theme.design;
  return theme.personality;
}

/**
 * Renders an SVG string for the given chart (as returned by
 * hdEngine.computeChart / computeChartFromUtcParts).
 */
export function renderBodyGraphSvg(
  chart: HdChart,
  { title = "", theme = DEFAULT_THEME }: { title?: string; theme?: BodyGraphTheme } = {},
): string {
  const positions = computeGatePositions();
  const definedSet = new Set(chart.definedCenters);

  const centerShapes = Object.entries(LAYOUT)
    .map(([name, layout]) => {
      const isDefined = definedSet.has(name);
      const fill = isDefined ? theme.centerDefined : theme.centerUndefined;
      return `<polygon points="${polyPoints(layout.poly)}" fill="${fill}" stroke="${theme.centerStroke}" stroke-width="1.5" opacity="${isDefined ? 0.92 : 1}" />`;
    })
    .join("\n");

  const channelLines = chart.formedChannels
    .map((ch) => {
      const [a, b] = ch.gates;
      const pa = positions[a];
      const pb = positions[b];
      if (!pa || !pb) return "";
      const sa = gateSide(chart, a);
      const sb = gateSide(chart, b);
      const bothSame = sa === sb ? sa : "both";
      const color = sideColor(bothSame, theme);
      return `<line x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}" stroke="${color}" stroke-width="3.5" stroke-linecap="round"><title>${a}-${b} ${ch.name}</title></line>`;
    })
    .join("\n");

  const activeGateSet = new Set(chart.activeGates);
  const gateDots = Object.entries(positions)
    .map(([gateStr, p]) => {
      const gate = Number(gateStr);
      const active = activeGateSet.has(gate);
      const side = active ? gateSide(chart, gate) : null;
      const color = active ? sideColor(side, theme) : theme.undefinedGate;
      const r = active ? 8 : 5.5;
      const strokeColor = active ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.18)";
      const labelColor = side === "personality" ? "#1B1F33" : "#FFFFFF";
      const label = `<text x="${p.x}" y="${p.y}" font-size="7.5" font-family="'IBM Plex Mono', monospace" font-weight="600" fill="${labelColor}" text-anchor="middle" dominant-baseline="central">${gate}</text>`;
      return `<g><circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${color}" stroke="${strokeColor}" stroke-width="0.75" /><title>Gate ${gate}${side ? " (" + side + ")" : ""}</title>${active ? label : ""}</g>`;
    })
    .join("\n");

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title ? title + " " : ""}Human Design BodyGraph">
    ${renderBackgroundWiring(theme)}
    ${channelLines}
    ${centerShapes}
    ${gateDots}
  </svg>`;
}

export { LAYOUT };
