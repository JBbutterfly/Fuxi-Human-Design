import type { CSSProperties, ReactNode } from "react";

export interface RadioProps {
  label?: ReactNode;
  checked?: boolean;
  onChange?: (checked: true) => void;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Radio({ label, checked = false, onChange, disabled, style }: RadioProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
    >
      <span
        onClick={() => !disabled && onChange?.(true)}
        style={{
          width: 16,
          height: 16,
          flex: "0 0 auto",
          borderRadius: "var(--r-pill)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-inset)",
          border: `1px solid ${checked ? "var(--accent)" : "var(--border-hairline)"}`,
          transition: "var(--motion-hover)",
        }}
      >
        {checked && <span style={{ width: 8, height: 8, borderRadius: "var(--r-pill)", background: "var(--accent)" }} />}
      </span>
      {label && <span style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{label}</span>}
    </label>
  );
}
