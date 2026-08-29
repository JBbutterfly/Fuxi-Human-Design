import type { CSSProperties, ReactNode } from "react";

export interface CheckboxProps {
  label?: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Checkbox({ label, checked = false, onChange, disabled, style }: CheckboxProps) {
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
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          width: 16,
          height: 16,
          flex: "0 0 auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: checked ? "var(--accent)" : "var(--bg-inset)",
          border: `1px solid ${checked ? "var(--accent)" : "var(--border-hairline)"}`,
          borderRadius: "var(--r-1)",
          transition: "var(--motion-hover)",
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 5.2L3.6 8 9 1.8" fill="none" stroke="var(--text-on-accent)" strokeWidth="1.6" />
          </svg>
        )}
      </span>
      {label && <span style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{label}</span>}
    </label>
  );
}
