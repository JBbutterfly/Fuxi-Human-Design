import type { CSSProperties } from "react";

type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

const ELEMENTS: [ElementKey, string, string][] = [
  ["wood", "Wood", "Beginnings"],
  ["fire", "Fire", "Expression"],
  ["earth", "Earth", "Grounding"],
  ["metal", "Metal", "Refinement"],
  ["water", "Water", "Depth"],
];

export interface ElementLegendProps {
  value?: ElementKey | null;
  onChange?: (value: ElementKey | null) => void;
  orientation?: "horizontal" | "vertical";
  showNotes?: boolean;
  style?: CSSProperties;
}

export function ElementLegend({ value, onChange, orientation = "horizontal", showNotes = false, style }: ElementLegendProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        gap: orientation === "vertical" ? "var(--sp-4)" : "var(--sp-7)",
        flexWrap: "wrap",
        ...style,
      }}
    >
      {ELEMENTS.map(([key, label, note]) => {
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(on ? null : key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-3)",
              background: "none",
              border: 0,
              padding: 0,
              cursor: onChange ? "pointer" : "default",
              opacity: value && !on ? 0.42 : 1,
              transition: "opacity var(--dur-fast) var(--ease-standard)",
            }}
          >
            <span style={{ width: 8, height: 8, background: `var(--el-${key})`, flex: "0 0 auto" }} />
            <span style={{ font: "var(--type-ui-sm)", color: on ? "var(--text-primary)" : "var(--text-secondary)", letterSpacing: "var(--ls-wide)" }}>
              {label}
            </span>
            {showNotes && <span style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--text-muted)" }}>{note}</span>}
          </button>
        );
      })}
    </div>
  );
}
