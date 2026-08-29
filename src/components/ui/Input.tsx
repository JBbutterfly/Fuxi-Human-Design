"use client";

import { useState } from "react";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "style" | "prefix"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: "sm" | "md" | "lg";
  mono?: boolean;
  style?: CSSProperties;
}

const HEIGHTS: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "var(--control-h-sm)",
  md: "var(--control-h-md)",
  lg: "var(--control-h-lg)",
};

export function Input({ label, hint, error, prefix, suffix, size = "md", mono = false, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const h = HEIGHTS[size];
  const borderColor = error ? "var(--status-error)" : focused ? "var(--border-focus)" : "var(--border-hairline)";

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", ...style }}>
      {label && (
        <span
          style={{
            font: "var(--type-eyebrow)",
            letterSpacing: "var(--ls-caps)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-3)",
          height: h,
          padding: "0 var(--sp-4)",
          background: "var(--bg-inset)",
          border: `1px solid ${borderColor}`,
          borderRadius: "var(--radius-control)",
          transition: "var(--motion-hover)",
        }}
      >
        {prefix && <span style={{ color: "var(--text-muted)", display: "inline-flex" }}>{prefix}</span>}
        <input
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: 0,
            outline: "none",
            color: "var(--text-primary)",
            font: mono ? "var(--type-mono)" : "var(--type-body-sm)",
          }}
        />
        {suffix && <span style={{ color: "var(--text-muted)", display: "inline-flex" }}>{suffix}</span>}
      </span>
      {(error || hint) && (
        <span style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: error ? "var(--status-error)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
