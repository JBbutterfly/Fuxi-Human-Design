"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChartReport } from "@/components/chart/ChartReport";
import { loadLocalChart, type LocalChartInput } from "@/lib/localChart";

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

  if (!stored) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "var(--prose-max)" }} className="flex-1 w-full mx-auto p-8 pb-20">
      <ChartReport input={stored} />
    </main>
  );
}
