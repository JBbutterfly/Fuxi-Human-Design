"use client";

import { useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

export interface ButtonProps {
  /** Visual role. `primary` = aged gold fill; `jade` for organic/secondary paths. */
  variant?: "primary" | "secondary" | "jade" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  style?: CSSProperties;
  type?: "button" | "submit";
}

const SIZES: Record<NonNullable<ButtonProps["size"]>, { h: string; px: string; fs: string }> = {
  sm: { h: "var(--control-h-sm)", px: "12px", fs: "var(--fs-12)" },
  md: { h: "var(--control-h-md)", px: "18px", fs: "var(--fs-13)" },
  lg: { h: "var(--control-h-lg)", px: "26px", fs: "var(--fs-14)" },
};

/** Primary action control. Uppercase, letterspaced, near-square corners. */
export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  onClick,
  children,
  style,
  type = "button",
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const s = SIZES[size];

  const skin: CSSProperties = (
    {
      primary: {
        background: pressed ? "var(--accent-press)" : hover ? "var(--accent-hover)" : "var(--accent)",
        color: "var(--text-on-accent)",
        border: "1px solid transparent",
      },
      secondary: {
        background: hover ? "var(--bg-hover)" : "transparent",
        color: "var(--text-primary)",
        border: `1px solid ${hover ? "var(--border-accent)" : "var(--border-hairline)"}`,
      },
      jade: {
        background: hover ? "var(--accent-2-hover)" : "var(--accent-2)",
        color: "var(--parchment-50)",
        border: "1px solid transparent",
      },
      ghost: {
        background: hover ? "var(--bg-hover)" : "transparent",
        color: hover ? "var(--text-accent)" : "var(--text-secondary)",
        border: "1px solid transparent",
      },
      danger: {
        background: "transparent",
        color: "var(--status-error)",
        border: `1px solid ${hover ? "var(--status-error)" : "var(--border-hairline)"}`,
      },
    } satisfies Record<NonNullable<ButtonProps["variant"]>, CSSProperties>
  )[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--sp-3)",
        height: s.h,
        padding: `0 ${s.px}`,
        width: fullWidth ? "100%" : "auto",
        font: `var(--fw-semibold) ${s.fs}/1 var(--font-ui)`,
        letterSpacing: "var(--ls-caps)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        borderRadius: "var(--radius-control)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "var(--motion-hover)",
        transform: pressed && !disabled ? "translateY(1px)" : "none",
        ...skin,
        ...style,
      }}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
