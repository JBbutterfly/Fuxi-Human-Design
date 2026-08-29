"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { HexagramGlyph } from "./HexagramGlyph";

const ELEMENT_LABEL: Record<string, string> = { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" };

export interface GateCardProps {
  number: number;
  name: string;
  /** Human Design center, e.g. "Throat". */
  center?: string;
  element?: "wood" | "fire" | "earth" | "metal" | "water";
  /** Six booleans, bottom line first. Omit until verified per-gate hexagram data exists. */
  lines?: boolean[];
  /** Activated in the current chart — turns the hexagram glyph and the number gold. */
  activated?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

/** A single gate in a list: hexagram (if known), zero-padded number, name, center, element. */
export function GateCard({ number, name, center, element, lines, activated = false, onClick, style }: GateCardProps) {
  const [hover, setHover] = useState(false);
  const keylineColor = element ? `var(--el-${element})` : "var(--border-hairline)";
  const elementTextColor = element ? `var(--el-${element}-text)` : undefined;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        gap: "var(--sp-5)",
        alignItems: "flex-start",
        padding: "var(--sp-5)",
        background: hover ? "var(--surface-card-hover)" : "var(--surface-card)",
        border: `1px solid ${hover ? "var(--border-accent)" : "var(--border-hairline)"}`,
        borderLeft: `2px solid ${keylineColor}`,
        borderRadius: "var(--radius-card)",
        minHeight: 76,
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : "default",
        transition: "var(--motion-hover)",
        ...style,
      }}
    >
      {lines && <HexagramGlyph lines={lines} size={34} color={activated ? "var(--accent)" : "var(--glyph-line)"} style={{ marginTop: 3 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-3)", minWidth: 0 }}>
          <span style={{ font: "var(--type-mono)", color: activated ? "var(--text-accent)" : "var(--text-muted)", flex: "0 0 auto" }}>
            {String(number).padStart(2, "0")}
          </span>
          <span
            title={name}
            style={{ font: "var(--type-h3)", color: "var(--text-primary)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {name}
          </span>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-4)", marginTop: "var(--sp-2)", font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--text-muted)" }}>
          {center && <span>{center}</span>}
          {element && <span style={{ color: elementTextColor }}>{ELEMENT_LABEL[element]}</span>}
        </div>
      </div>
    </div>
  );
}
