"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  style?: CSSProperties;
}

export function Textarea({ label, hint, error, style, rows = 8, ...rest }: TextareaProps) {
  const [focused, setFocused] = useState(false);
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
      <textarea
        rows={rows}
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
          resize: "vertical",
          padding: "var(--sp-4)",
          background: "var(--bg-inset)",
          border: `1px solid ${borderColor}`,
          borderRadius: "var(--radius-control)",
          outline: "none",
          color: "var(--text-primary)",
          font: "var(--type-body-sm)",
          transition: "var(--motion-hover)",
        }}
      />
      {(error || hint) && (
        <span style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: error ? "var(--status-error)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
