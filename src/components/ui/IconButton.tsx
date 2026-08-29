"use client";

import { useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

export interface IconButtonProps {
  /** Accessible label — required; also used as the tooltip. */
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline";
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  style?: CSSProperties;
}

const SIZES: Record<NonNullable<IconButtonProps["size"]>, number> = { sm: 28, md: 36, lg: 44 };

/** Square, label-required glyph button for toolbars and app chrome. */
export function IconButton({ label, size = "md", variant = "ghost", active = false, onClick, children, style }: IconButtonProps) {
  const [hover, setHover] = useState(false);
  const d = SIZES[size];
  const bg = active ? "var(--bg-active)" : hover ? "var(--bg-hover)" : "transparent";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: d,
        height: d,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: active ? "var(--text-accent)" : hover ? "var(--text-primary)" : "var(--text-secondary)",
        border: `1px solid ${variant === "outline" ? "var(--border-hairline)" : "transparent"}`,
        borderRadius: "var(--radius-control)",
        cursor: "pointer",
        transition: "var(--motion-hover)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
