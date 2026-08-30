// ─────────────────────────────────────────────────────────────────────────
// Five Elements Lens — Lower-Trigram Method v1
//
// Human Design does not itself assign a Wu Xing (five-element) phase to
// each gate — there is no official, universally-recognized gate-to-element
// mapping in HD source material. This is Fuxi's own interpretive layer,
// built from two things that ARE established:
//
//   1. Each of the 64 HD gates corresponds 1:1 to a King Wen hexagram
//      (gate N = hexagram N), and every hexagram decomposes into a lower
//      trigram (its bottom 3 lines) and an upper trigram (its top 3 lines).
//   2. The traditional Wu Xing correspondence for the 8 trigrams: Qian
//      (Heaven) and Dui (Lake) = Metal; Li (Fire) = Fire; Zhen (Thunder)
//      and Xun (Wind) = Wood; Kan (Water) = Water; Gen (Mountain) and Kun
//      (Earth) = Earth.
//
// A hexagram has two trigrams, so it has two candidate elements — there's
// no traditional rule that collapses this to one. This module makes an
// explicit, disclosed product choice: the LOWER trigram (the gate's "inner
// foundation") is the gate's primary element; the upper trigram (its
// "outward expression") is kept as a secondary. Show both in the UI rather
// than presenting "primary" as if it were the only correct answer.
//
// The lower/upper -> gate matrix below is the King Wen sequence itself,
// not invented — verified here against several independently-checkable
// classical hexagram structures (Qian/Qian=1, Kun/Kun=2, Tai=11, Pi=12,
// Chi Chi=63, Wei Chi=64, Ta Chuang=34, Sun/Decrease=41, Chun=3, Meng=4,
// Kan/Kan=29, Li/Li=30) before being trusted here. GATE_ELEMENTS is
// generated from this matrix rather than hand-entered, so there's one
// source of truth instead of two lists that could silently drift apart.
// ─────────────────────────────────────────────────────────────────────────

export type FiveElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

export type Trigram = "Heaven" | "Lake" | "Fire" | "Thunder" | "Wind" | "Water" | "Mountain" | "Earth";

export const TRIGRAM_ELEMENT: Record<Trigram, FiveElement> = {
  Heaven: "Metal",
  Lake: "Metal",
  Fire: "Fire",
  Thunder: "Wood",
  Wind: "Wood",
  Water: "Water",
  Mountain: "Earth",
  Earth: "Earth",
};

// King Wen sequence: [lower trigram][upper trigram] -> gate/hexagram number.
const KING_WEN_MATRIX: Record<Trigram, Record<Trigram, number>> = {
  Heaven: { Heaven: 1, Lake: 43, Fire: 14, Thunder: 34, Wind: 9, Water: 5, Mountain: 26, Earth: 11 },
  Lake: { Heaven: 10, Lake: 58, Fire: 38, Thunder: 54, Wind: 61, Water: 60, Mountain: 41, Earth: 19 },
  Fire: { Heaven: 13, Lake: 49, Fire: 30, Thunder: 55, Wind: 37, Water: 63, Mountain: 22, Earth: 36 },
  Thunder: { Heaven: 25, Lake: 17, Fire: 21, Thunder: 51, Wind: 42, Water: 3, Mountain: 27, Earth: 24 },
  Wind: { Heaven: 44, Lake: 28, Fire: 50, Thunder: 32, Wind: 57, Water: 48, Mountain: 18, Earth: 46 },
  Water: { Heaven: 6, Lake: 47, Fire: 64, Thunder: 40, Wind: 59, Water: 29, Mountain: 4, Earth: 7 },
  Mountain: { Heaven: 33, Lake: 31, Fire: 56, Thunder: 62, Wind: 53, Water: 39, Mountain: 52, Earth: 15 },
  Earth: { Heaven: 12, Lake: 45, Fire: 35, Thunder: 16, Wind: 20, Water: 8, Mountain: 23, Earth: 2 },
};

export interface GateElement {
  gate: number;
  lowerTrigram: Trigram;
  upperTrigram: Trigram;
  /** The gate's Five Elements Lens color/keyline — derived from the lower trigram. */
  primary: FiveElement;
  /** Kept alongside primary rather than discarded — the upper trigram's element. */
  secondary: FiveElement;
}

/** The lowercase key GateCard/ElementLegend's CSS vars use (--el-wood, --el-fire, ...). */
export type ElementCssKey = "wood" | "fire" | "earth" | "metal" | "water";
export function elementCssKey(el: FiveElement): ElementCssKey {
  return el.toLowerCase() as ElementCssKey;
}

export const GATE_ELEMENTS: Record<number, GateElement> = {};
for (const [lower, row] of Object.entries(KING_WEN_MATRIX) as [Trigram, Record<Trigram, number>][]) {
  for (const [upper, gate] of Object.entries(row) as [Trigram, number][]) {
    GATE_ELEMENTS[gate] = {
      gate,
      lowerTrigram: lower,
      upperTrigram: upper,
      primary: TRIGRAM_ELEMENT[lower],
      secondary: TRIGRAM_ELEMENT[upper],
    };
  }
}
