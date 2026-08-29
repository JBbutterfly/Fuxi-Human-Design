"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui";
import { GATE_NAMES } from "@/engine/gateNames";
import { GATE_DESCRIPTIONS } from "@/engine/gateDescriptions";
import { CHANNEL_DESCRIPTIONS } from "@/engine/channelDescriptions";
import { GATE_TO_CENTER, GATE_PARTNERS, CHANNEL_BY_KEY, CHANNEL_KEY } from "@/engine/hdData";

export default function GateDetailPage() {
  const { number } = useParams<{ number: string }>();
  const gate = Number(number);
  const valid = Number.isInteger(gate) && gate >= 1 && gate <= 64;

  if (!valid) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--status-error)" }}>No such gate.</p>
      </main>
    );
  }

  const name = GATE_NAMES[gate][1];
  const center = GATE_TO_CENTER[gate];
  const description = GATE_DESCRIPTIONS[gate];
  const partners = GATE_PARTNERS[gate] ?? [];

  return (
    <main style={{ maxWidth: "var(--prose-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <Link href="/gates" style={{ borderBottom: "none", display: "inline-flex", alignItems: "center", gap: "var(--sp-3)" }}>
        <Icon name="arrow-left" size={15} color="var(--text-muted)" />
        <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>Gates</span>
      </Link>

      <div>
        <span style={{ font: "var(--type-mono)", color: "var(--text-accent)" }}>{String(gate).padStart(2, "0")}</span>
        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)", marginTop: "var(--sp-2)" }}>{name}</h1>
        <p style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)", marginTop: "var(--sp-2)" }}>{center}</p>
      </div>

      <p style={{ font: "var(--type-body)", color: "var(--text-primary)" }}>{description}</p>

      {partners.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className="fuxi-eyebrow">Channels</span>
          {partners.map((partner) => {
            const key = CHANNEL_KEY(gate, partner);
            const channel = CHANNEL_BY_KEY[key];
            return (
              <div key={key} style={{ padding: "var(--sp-5)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-card)", background: "var(--surface-card)" }}>
                <div className="flex items-center gap-3">
                  <span style={{ font: "var(--type-mono)", color: "var(--text-muted)" }}>{key}</span>
                  <span style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>{channel.name}</span>
                  <Link href={`/gates/${partner}`} style={{ marginLeft: "auto", font: "var(--type-ui-sm)" }}>
                    Gate {partner}
                  </Link>
                </div>
                <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)", marginTop: "var(--sp-3)" }}>
                  {CHANNEL_DESCRIPTIONS[key]}
                </p>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
