import type { CSSProperties, ReactNode } from "react";

export interface BadgeProps {
  tone?: "neutral" | "gold" | "jade" | "error";
  children?: ReactNode;
  style?: CSSProperties;
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, [string, string, string]> = {
  neutral: ["var(--bg-inset)", "var(--text-secondary)", "var(--border-hairline)"],
  gold: ["rgba(201,150,44,.12)", "var(--text-accent)", "var(--gold-700)"],
  jade: ["rgba(31,92,78,.22)", "var(--jade-300)", "var(--jade-700)"],
  error: ["rgba(201,80,62,.14)", "var(--status-error)", "rgba(201,80,62,.4)"],
};

export function Badge({ tone = "neutral", children, style }: BadgeProps) {
  const [bg, fg, bd] = TONES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sp-2)",
        height: 20,
        padding: "0 var(--sp-3)",
        background: bg,
        color: fg,
        border: `1px solid ${bd}`,
        borderRadius: "var(--r-1)",
        font: "var(--type-eyebrow)",
        letterSpacing: "var(--ls-caps)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        flex: "0 0 auto",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
