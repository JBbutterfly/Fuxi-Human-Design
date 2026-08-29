import type { CSSProperties } from "react";

export interface HexagramGlyphProps {
  /** Six booleans, bottom line first. true = yang (solid), false = yin (broken). */
  lines?: boolean[];
  size?: number;
  gap?: number;
  color?: string;
  thickness?: number;
  style?: CSSProperties;
}

/** A hexagram is six stacked lines, read bottom-to-top. */
export function HexagramGlyph({
  lines = [true, false, true, false, true, false],
  size = 44,
  gap,
  color = "var(--glyph-line)",
  thickness,
  style,
}: HexagramGlyphProps) {
  const t = thickness || Math.max(2, Math.round(size / 14));
  const g = gap || Math.max(3, Math.round(size / 9));
  const rows = [...lines].slice(0, 6).reverse();

  return (
    <span aria-hidden="true" style={{ display: "inline-flex", flexDirection: "column", gap: g, width: size, ...style }}>
      {rows.map((yang, i) =>
        yang ? (
          <span key={i} style={{ height: t, background: color, display: "block" }} />
        ) : (
          <span key={i} style={{ height: t, display: "flex", gap: Math.round(size * 0.22) }}>
            <span style={{ flex: 1, background: color }} />
            <span style={{ flex: 1, background: color }} />
          </span>
        ),
      )}
    </span>
  );
}
