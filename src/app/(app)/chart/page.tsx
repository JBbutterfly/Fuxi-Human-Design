"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { computeChartFromUtcParts, type HdChart } from "@/engine/hdEngine";
import { renderBodyGraphSvg } from "@/lib/bodygraph";
import { birthDataToUtcDate, loadLocalChart, type LocalChartInput } from "@/lib/localChart";
import {
  CENTER_NAMES,
  CENTER_DESCRIPTIONS,
  PROFILE_NARRATIVES,
} from "@/engine/hdData";
import { CENTER_NARRATIVES } from "@/engine/centerNarratives";
import { GATE_NAMES } from "@/engine/gateNames";
import { GATE_DESCRIPTIONS } from "@/engine/gateDescriptions";
import { CHANNEL_DESCRIPTIONS } from "@/engine/channelDescriptions";
import { ACTIVATION_ORDER, ACTIVATION_LABELS, type ActivationKey } from "@/engine/ephemeris";
import { computeNatalAstrology } from "@/engine/astrology";

const READING_DEPTH_LABEL: Record<LocalChartInput["readingDepth"], string> = {
  both: "Personality and design",
  personality: "Personality only",
  design: "Design only",
};

function chartIntro(name: string) {
  return `This chart is calculated from ${name}'s exact birth date, time, and place, combined with where the planets sat in the sky at that moment — no two combinations are the same. The BodyGraph below is nine geometric shapes (Centers) connected by lines (Channels), built from gates — the specific activation points at each end. A filled-in Center runs on a fixed, reliable current; a white one is open, meaning it picks up and amplifies whatever energy is around it. Everything on this page breaks down exactly what that means for ${name}.`;
}

export default function ChartPage() {
  const router = useRouter();
  const [stored, setStored] = useState<LocalChartInput | null | undefined>(undefined);

  useEffect(() => {
    const found = loadLocalChart();
    if (!found) {
      router.replace("/chart/new");
      return;
    }
    setStored(found);
  }, [router]);

  const chart = useMemo<HdChart | null>(() => {
    if (!stored) return null;
    return computeChartFromUtcParts(birthDataToUtcDate(stored.birthData));
  }, [stored]);

  const astro = useMemo(() => {
    if (!chart || !stored) return null;
    return computeNatalAstrology(chart.personalityTime, stored.birthData.latitude, stored.birthData.longitude);
  }, [chart, stored]);

  const svg = useMemo(() => (chart ? renderBodyGraphSvg(chart, { title: stored?.subjectName }) : null), [chart, stored]);

  if (!stored || !chart || !astro) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
      </main>
    );
  }

  const name = stored.subjectName;
  const definedSet = new Set(chart.definedCenters);
  const definedFirst = [...CENTER_NAMES].sort((a, b) => Number(definedSet.has(b)) - Number(definedSet.has(a)));
  const groupCount = chart.definitionComponents.length;

  return (
    <main style={{ maxWidth: "var(--prose-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-12 pb-20">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="fuxi-eyebrow">Chart snapshot</span>
          <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)", marginTop: "var(--sp-2)" }}>{name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge tone="gold">{READING_DEPTH_LABEL[stored.readingDepth]}</Badge>
          <Link href="/chart/new" style={{ borderBottom: "none" }}>
            <Button variant="ghost" size="sm">
              New chart
            </Button>
          </Link>
        </div>
      </div>

      <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>{chartIntro(name)}</p>

      {/* ── Snapshot facts ── */}
      <Section eyebrow="Snapshot">
        <Card className="flex flex-col gap-1">
          <Fact label="Type" value={`${chart.type} · ${chart.typeInfo.population} of people`} />
          <Fact label="Strategy" value={chart.typeInfo.strategy} />
          <Fact label="Authority" value={chart.authority.name} />
          <Fact label="Profile" value={`${chart.profile} · ${chart.incarnationCross.profileName}`} />
          <Fact
            label="Definition"
            value={chart.definition === "None" ? chart.definition : `${chart.definition} · ${groupCount} connected group${groupCount === 1 ? "" : "s"}`}
          />
          <Fact label="Incarnation cross" value={chart.incarnationCross.label} />
        </Card>
      </Section>

      {/* ── BodyGraph ── */}
      <Section>
        <Card padding="var(--sp-5)">
          <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: svg ?? "" }} />
        </Card>
        <div className="flex flex-wrap gap-2">
          {chart.activeGates.map((g) => (
            <a
              key={g}
              href={`#gate-${g}`}
              className="mono"
              style={{ color: "var(--text-secondary)", padding: "2px 8px", border: "1px solid var(--border-hairline)", borderRadius: "var(--r-1)", fontFamily: "var(--font-mono)" }}
            >
              {g}
            </a>
          ))}
        </div>
        <div className="flex gap-6 flex-wrap" style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>
          <LegendDot color="#F6F2E8" label="Personality (conscious)" />
          <LegendDot color="#2E8069" label="Design (unconscious)" />
          <LegendDot color="#E0C079" label="Both" />
        </div>
      </Section>

      {/* ── What this means ── */}
      <Section eyebrow="What this means">
        <Card className="flex flex-col gap-4">
          <p style={{ font: "var(--type-body)", color: "var(--text-primary)" }}>{chart.typeInfo.summary}</p>
          <p style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>
            Signature: {chart.typeInfo.signature} · Not-Self Theme: {chart.typeInfo.notSelfTheme}
          </p>
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{chart.authority.guidance}</p>
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{chart.definitionText}</p>
        </Card>
      </Section>

      {/* ── Centers (compact) ── */}
      <Section eyebrow="Centers">
        <div className="flex flex-col gap-2">
          {CENTER_NAMES.map((c) => (
            <Card key={c} padding="var(--sp-4) var(--sp-5)" className="flex items-center justify-between gap-4">
              <div>
                <span style={{ font: "var(--type-ui)", color: "var(--text-primary)" }}>{c}</span>
                <p style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--text-muted)", marginTop: 2 }}>
                  {CENTER_DESCRIPTIONS[c]}
                </p>
              </div>
              <Badge tone={definedSet.has(c) ? "gold" : "neutral"}>{definedSet.has(c) ? "Defined" : "Open"}</Badge>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Formed channels (compact, jumps to full description below) ── */}
      {chart.formedChannels.length > 0 && (
        <Section eyebrow={`Formed channels (${chart.formedChannels.length})`}>
          <div className="flex flex-col gap-2">
            {chart.formedChannels.map((ch) => {
              const key = `${Math.min(...ch.gates)}-${Math.max(...ch.gates)}`;
              return (
                <a key={key} href={`#channel-${key}`} style={{ borderBottom: "none" }}>
                  <Card interactive padding="var(--sp-4) var(--sp-5)" className="flex items-center gap-3">
                    <span className="mono" style={{ color: "var(--text-accent)", fontFamily: "var(--font-mono)" }}>
                      {key}
                    </span>
                    <span style={{ font: "var(--type-ui)", color: "var(--text-primary)" }}>{ch.name}</span>
                    <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)", marginLeft: "auto" }}>
                      {ch.centers[0]} ↔ {ch.centers[1]}
                    </span>
                  </Card>
                </a>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Personality / Design activation tables ── */}
      <Section eyebrow="Personality — conscious">
        <ActivationTable activations={chart.personality} />
      </Section>
      <Section eyebrow="Design — unconscious">
        <ActivationTable activations={chart.design} />
      </Section>

      {/* ── In depth ── */}
      <div>
        <span className="fuxi-eyebrow" style={{ fontSize: 13 }}>
          In depth
        </span>
        <h2 style={{ font: "var(--type-h2)", color: "var(--text-primary)", marginTop: "var(--sp-3)" }}>
          {name}&apos;s type, profile &amp; centers
        </h2>
      </div>

      <Section eyebrow={`${chart.type} — in depth`}>
        <Card className="flex flex-col gap-4">
          <div>
            <span className="fuxi-eyebrow">On track</span>
            <p style={{ marginTop: "var(--sp-2)", font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{chart.typeInfo.onTrack}</p>
          </div>
          <div>
            <span className="fuxi-eyebrow">Off track</span>
            <p style={{ marginTop: "var(--sp-2)", font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{chart.typeInfo.offTrack}</p>
          </div>
          <div>
            <span className="fuxi-eyebrow">What the {chart.typeInfo.notSelfTheme} talk sounds like</span>
            <ul style={{ marginTop: "var(--sp-2)", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              {chart.typeInfo.notSelfTalk.map((t) => (
                <li key={t} style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Section>

      <Section eyebrow={`Profile ${chart.profile} — ${chart.incarnationCross.profileName}`}>
        <Card>
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{PROFILE_NARRATIVES[chart.profile]}</p>
        </Card>
      </Section>

      <Section eyebrow="Centers — in depth">
        <div className="flex flex-col gap-4">
          {definedFirst.map((c) => (
            <CenterDepth key={c} name={c} defined={definedSet.has(c)} chart={chart} />
          ))}
        </div>
      </Section>

      {chart.formedChannels.length > 0 && (
        <Section eyebrow={`${name}'s channels`}>
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
            A channel forms when both of its gates are active — a live, consistent circuit connecting two centers.
            This is the energy {name} carries reliably, not just on their good days.
          </p>
          <div className="flex flex-col gap-3">
            {chart.formedChannels.map((ch) => {
              const [a, b] = ch.gates;
              const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
              return (
                <Card key={key} id={`channel-${key}`} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="mono" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {key}
                    </span>
                    <span style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>{ch.name}</span>
                    <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)", marginLeft: "auto" }}>
                      {ch.centers[0]} ↔ {ch.centers[1]}
                    </span>
                  </div>
                  <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{CHANNEL_DESCRIPTIONS[key]}</p>
                </Card>
              );
            })}
          </div>
        </Section>
      )}

      <Section eyebrow={`${name}'s gates`}>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
          All {chart.activeGates.length} of {name}&apos;s activated gates — the specific themes that make up their
          design, whether or not they&apos;ve completed a channel yet.
        </p>
        <div className="flex flex-col gap-3">
          {chart.activeGates.map((g) => {
            const sides = chart.gateSides[g];
            const side = sides.personality && sides.design ? "Personality & Design" : sides.personality ? "Personality" : "Design";
            return (
              <Card key={g} id={`gate-${g}`} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="mono" style={{ color: "var(--text-accent)", fontFamily: "var(--font-mono)" }}>
                    {String(g).padStart(2, "0")}
                  </span>
                  <span style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>{GATE_NAMES[g][0]}</span>
                  <Badge tone="neutral">{side}</Badge>
                </div>
                <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{GATE_DESCRIPTIONS[g]}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* ── Astrology ── */}
      <Section eyebrow="Astrology snapshot">
        <Card className="flex gap-8 flex-wrap">
          <QuickPlacement label="Sun" placement={astro.placements.Sun} />
          <QuickPlacement label="Moon" placement={astro.placements.Moon} />
          {astro.ascendant && <QuickPlacement label="Ascendant" placement={astro.ascendant} />}
        </Card>
        <Card style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-body-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                {["Planet", "Sign", "Degree", "House"].map((h) => (
                  <th key={h} className="fuxi-eyebrow" style={{ textAlign: "left", padding: "8px 12px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(astro.placements).map(([planet, p]) => (
                <tr key={planet} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--text-primary)" }}>{planet}</td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>{p.sign}</td>
                  <td className="mono" style={{ padding: "8px 12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {p.degreeInSign.toFixed(2)}°
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>{p.house ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {astro.aspects.length > 0 && (
          <Card style={{ overflowX: "auto" }}>
            <span className="fuxi-eyebrow">Major aspects</span>
            <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-body-sm)", marginTop: "var(--sp-3)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                  {["Pair", "Aspect", "Orb"].map((h) => (
                    <th key={h} className="fuxi-eyebrow" style={{ textAlign: "left", padding: "8px 12px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {astro.aspects.map((asp, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                    <td style={{ padding: "8px 12px", color: "var(--text-primary)" }}>
                      {asp.a} {asp.symbol} {asp.b}
                    </td>
                    <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>{asp.aspect}</td>
                    <td className="mono" style={{ padding: "8px 12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {asp.orb}°
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </Section>

      {/* ── One-on-one ── */}
      <Section eyebrow="One-on-one">
        <Card className="flex flex-col gap-3">
          <h3 style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>How {name} connects with someone else</h3>
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
            Once {name} is in a community with someone else who&apos;s shared their chart, this section will let you
            pick them and see the specific channels between the two of you, who carries what center-by-center, and
            concrete guidance on how each of you can support the other. Not built yet in this preview — the
            connection logic itself is ready, it just needs a community with a second shared chart to compare against.
          </p>
        </Card>
      </Section>
    </main>
  );
}

function Section({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      {eyebrow && <span className="fuxi-eyebrow">{eyebrow}</span>}
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ font: "var(--type-ui)", color: "var(--text-primary)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function ActivationTable({ activations }: { activations: HdChart["personality"] }) {
  return (
    <Card style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-body-sm)" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-hairline)" }}>
            {["Point", "Gate.Line", "Gate name"].map((h) => (
              <th key={h} className="fuxi-eyebrow" style={{ textAlign: "left", padding: "8px 12px" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACTIVATION_ORDER.map((key: ActivationKey) => {
            const a = activations[key];
            return (
              <tr key={key} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                <td style={{ padding: "8px 12px", color: "var(--text-primary)" }}>{ACTIVATION_LABELS[key]}</td>
                <td className="mono" style={{ padding: "8px 12px", color: "var(--text-accent)", fontFamily: "var(--font-mono)" }}>
                  {a.gate}.{a.line}
                </td>
                <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>{GATE_NAMES[a.gate][0]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function QuickPlacement({ label, placement }: { label: string; placement: { sign: string; degreeInSign: number } }) {
  return (
    <div>
      <div style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>{label}</div>
      <div style={{ font: "var(--type-h3)", color: "var(--text-primary)", marginTop: 2 }}>
        {placement.sign} {placement.degreeInSign.toFixed(1)}°
      </div>
    </div>
  );
}

function CenterDepth({ name, defined, chart }: { name: string; defined: boolean; chart: HdChart }) {
  const narrative = CENTER_NARRATIVES[name];
  if (defined) {
    return (
      <Card id={`center-${name.replace(/\s+/g, "-").toLowerCase()}`} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h3 style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>{name}</h3>
          <Badge tone="gold">Defined</Badge>
        </div>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{narrative.defined.summary}</p>
        <div>
          <span className="fuxi-eyebrow">Well expressed</span>
          <p style={{ marginTop: "var(--sp-2)", font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{narrative.defined.wellExpressed}</p>
        </div>
        <div>
          <span className="fuxi-eyebrow">Under pressure</span>
          <p style={{ marginTop: "var(--sp-2)", font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{narrative.defined.underPressure}</p>
        </div>
      </Card>
    );
  }

  const flavor = chart.openCenterFlavor[name];
  return (
    <Card id={`center-${name.replace(/\s+/g, "-").toLowerCase()}`} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h3 style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>{name}</h3>
        <Badge tone="neutral">Open</Badge>
      </div>
      <p style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{narrative.open.summary}</p>
      <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
        {flavor?.kind === "flavored"
          ? `Gates ${flavor.gates.map((g) => `${g} (${GATE_NAMES[g][0]})`).join(", ")} ${flavor.gates.length === 1 ? "is" : "are"} active here without ${flavor.gates.length === 1 ? "its" : "their"} channel partner — this open center carries a specific flavor rather than being a total blank.`
          : "No gate at all is active here — completely open, with no built-in filter whatsoever on this theme."}
      </p>
      <div>
        <span className="fuxi-eyebrow">Not-self theme</span>
        <p style={{ marginTop: "var(--sp-2)", font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{narrative.open.notSelfTheme}</p>
      </div>
      <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
        {narrative.open.notSelfTalk.map((t) => (
          <li key={t} style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
            {t}
          </li>
        ))}
      </ul>
      <div>
        <span className="fuxi-eyebrow">Reflection</span>
        <p style={{ marginTop: "var(--sp-2)", font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{narrative.open.reflectionQuestion}</p>
      </div>
      <div>
        <span className="fuxi-eyebrow">The gift</span>
        <p style={{ marginTop: "var(--sp-2)", font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>{narrative.open.gift}</p>
      </div>
    </Card>
  );
}
