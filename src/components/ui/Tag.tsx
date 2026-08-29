import type { CSSProperties, ReactNode } from "react";

export interface TagProps {
  element?: "wood" | "fire" | "earth" | "metal" | "water";
  onRemove?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Tag({ element, onRemove, children, style }: TagProps) {
  const c = element ? `var(--el-${element})` : "var(--parchment-400)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        height: 24,
        padding: "0 var(--sp-4)",
        background: "transparent",
        border: "1px solid var(--border-hairline)",
        borderLeft: `2px solid ${c}`,
        borderRadius: "var(--r-1)",
        font: "var(--type-ui-sm)",
        color: "var(--text-secondary)",
        whiteSpace: "nowrap",
        flex: "0 0 auto",
        ...style,
      }}
    >
      {children}
      {onRemove && (
        <span
          onClick={onRemove}
          role="button"
          aria-label="Remove"
          style={{ cursor: "pointer", color: "var(--text-muted)", font: "var(--type-mono)" }}
        >
          ×
        </span>
      )}
    </span>
  );
}
