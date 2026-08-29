"use client";

import { useState } from "react";
import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "style"> {
  as?: ElementType;
  interactive?: boolean;
  padding?: string;
  accent?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Card({ as: El = "div", interactive = false, padding = "var(--sp-7)", accent, children, style, ...rest }: CardProps) {
  const [hover, setHover] = useState(false);

  return (
    <El
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: interactive && hover ? "var(--surface-card-hover)" : "var(--surface-card)",
        border: `1px solid ${interactive && hover ? "var(--border-accent)" : "var(--border-hairline)"}`,
        borderTop: accent ? `2px solid ${accent}` : undefined,
        borderRadius: "var(--radius-card)",
        padding,
        boxShadow: "var(--shadow-card)",
        cursor: interactive ? "pointer" : undefined,
        transition: "var(--motion-hover)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </El>
  );
}
