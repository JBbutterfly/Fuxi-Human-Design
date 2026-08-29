"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { computeChartFromUtcParts, type HdChart } from "@/engine/hdEngine";
import { renderBodyGraphSvg } from "@/lib/bodygraph";
import { birthDataToUtcDate, loadLocalChart, type LocalChartInput } from "@/lib/localChart";

const READING_DEPTH_LABEL: Record<LocalChartInput["readingDepth"], string> = {
  both: "Personality and design",
  personality: "Personality only",
  design: "Design only",
};

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

  const svg = useMemo(() => (chart ? renderBodyGraphSvg(chart, { title: stored?.subjectName }) : null), [chart, stored]);

  if (stored === undefined || !chart) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "var(--content-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>{stored!.subjectName}</h1>
          <p style={{ font: "var(--type-mono)", color: "var(--text-muted)", marginTop: "var(--sp-2)" }}>
            {stored!.birthData.date} · {stored!.birthData.time} · {stored!.birthData.location}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge tone="gold">{READING_DEPTH_LABEL[stored!.readingDepth]}</Badge>
          <Link href="/chart/new" style={{ borderBottom: "none" }}>
            <Button variant="ghost" size="sm">
              New chart
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-7">
        <Card padding="var(--sp-5)">
          <div
            style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}
            dangerouslySetInnerHTML={{ __html: svg ?? "" }}
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <Fact label="Type" value={chart.type} />
            <Fact label="Strategy" value={chart.typeInfo.strategy} />
            <Fact label="Authority" value={chart.authority.name} />
            <Fact label="Profile" value={`${chart.profile} · ${chart.incarnationCross.profileName}`} />
            <Fact label="Definition" value={chart.definition} />
          </Card>
          <Card className="flex flex-col gap-3">
            <span className="fuxi-eyebrow">Incarnation cross</span>
            <p style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{chart.incarnationCross.label}</p>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ font: "var(--type-ui)", color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
