import { Card } from "@/components/ui";
import { ElementLegend } from "@/components/domain/ElementLegend";

export default function ElementsPage() {
  return (
    <main style={{ maxWidth: "var(--prose-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-6">
      <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>Elements</h1>
      <ElementLegend showNotes />
      <Card>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
          Each gate carries one of the five elements — wood, fire, earth, metal, water — as a functional grouping,
          not a decoration. That mapping isn&apos;t verified for all 64 gates yet, so the elemental balance view isn&apos;t
          built here until it is.
        </p>
      </Card>
    </main>
  );
}
