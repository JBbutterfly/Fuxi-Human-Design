import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { ElementLegend } from "@/components/domain/ElementLegend";
import { GATE_NAMES } from "@/engine/gateNames";
import { GATE_ELEMENTS, elementCssKey, type ElementCssKey, type FiveElement } from "@/engine/fiveElements";

const ELEMENT_ORDER: FiveElement[] = ["Wood", "Fire", "Earth", "Metal", "Water"];

const gatesByElement: Record<FiveElement, number[]> = { Wood: [], Fire: [], Earth: [], Metal: [], Water: [] };
for (let gate = 1; gate <= 64; gate++) {
  gatesByElement[GATE_ELEMENTS[gate].primary].push(gate);
}

export default function ElementsPage() {
  return (
    <main style={{ maxWidth: "var(--prose-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <div>
        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>Elements</h1>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)", marginTop: "var(--sp-3)" }}>
          Human Design doesn&apos;t itself assign a Wu Xing element to each gate. This is Fuxi&apos;s own lens: every
          gate is Hexagram <span style={{ font: "var(--type-mono)" }}>N</span>, every hexagram has a lower and upper
          trigram, and each trigram carries a traditional element. The lower trigram is read as the gate&apos;s primary
          element; the upper trigram is kept as a secondary. See any gate&apos;s page for its own breakdown.
        </p>
      </div>

      <ElementLegend showNotes />

      <div className="flex flex-col gap-4">
        {ELEMENT_ORDER.map((el) => {
          const gates = gatesByElement[el];
          const cssKey: ElementCssKey = elementCssKey(el);
          return (
            <Card key={el} accent={`var(--el-${cssKey})`} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>{el}</span>
                <Badge tone="neutral">{gates.length} gates</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {gates.map((g) => (
                  <Link
                    key={g}
                    href={`/gates/${g}`}
                    style={{
                      borderBottom: "none",
                      font: "var(--type-mono)",
                      color: "var(--text-secondary)",
                      padding: "2px var(--sp-3)",
                      border: "1px solid var(--border-hairline)",
                      borderRadius: "var(--r-1)",
                    }}
                    title={GATE_NAMES[g][1]}
                  >
                    {String(g).padStart(2, "0")}
                  </Link>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
