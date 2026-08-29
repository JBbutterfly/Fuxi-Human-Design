"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon, Input } from "@/components/ui";
import { GateCard } from "@/components/domain/GateCard";
import { GATE_NAMES } from "@/engine/gateNames";
import { GATE_TO_CENTER } from "@/engine/hdData";

const ALL_GATES = Array.from({ length: 64 }, (_, i) => i + 1).map((number) => ({
  number,
  name: GATE_NAMES[number][1],
  center: GATE_TO_CENTER[number],
}));

export default function GateLibraryPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_GATES;
    return ALL_GATES.filter(
      (g) => g.name.toLowerCase().includes(q) || g.center.toLowerCase().includes(q) || String(g.number).includes(q),
    );
  }, [query]);

  return (
    <main style={{ maxWidth: "var(--content-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>Read all 64</h1>
        <div style={{ width: 260 }}>
          <Input placeholder="Search gates" prefix={<Icon name="search" size={15} />} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((g) => (
          <Link key={g.number} href={`/gates/${g.number}`} style={{ borderBottom: "none" }}>
            <GateCard number={g.number} name={g.name} center={g.center} />
          </Link>
        ))}
      </div>
    </main>
  );
}
