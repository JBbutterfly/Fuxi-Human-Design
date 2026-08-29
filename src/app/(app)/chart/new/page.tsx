"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Radio } from "@/components/ui";
import { searchPlaces, formatOffset, tzOffsetMinutesAt, type PlaceResult } from "@/engine/geocode";
import { birthDataToUtcDate, saveLocalChart, type ReadingDepth } from "@/lib/localChart";

const STEPS = ["Birth data", "Reading depth", "Confirm"];

const READING_DEPTHS: { key: ReadingDepth; title: string; detail: string }[] = [
  { key: "both", title: "Personality and design", detail: "64 gates, both transits" },
  { key: "personality", title: "Personality only", detail: "Conscious gates" },
  { key: "design", title: "Design only", detail: "Unconscious gates" },
];

export default function NewChartPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [subjectName, setSubjectName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [readingDepth, setReadingDepth] = useState<ReadingDepth>("both");
  const [error, setError] = useState<string | null>(null);

  // Debounced place search — re-searches only after typing settles, and
  // drops the previous selection since it no longer matches what's typed.
  useEffect(() => {
    setSelectedPlace(null);
    if (placeQuery.trim().length < 2) {
      setPlaceResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      searchPlaces(placeQuery)
        .then(setPlaceResults)
        .catch(() => setPlaceResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [placeQuery]);

  const canContinueStep0 = subjectName.trim() && birthDate && birthTime && selectedPlace;

  function selectPlace(p: PlaceResult) {
    setSelectedPlace(p);
    setPlaceQuery(p.label);
    setPlaceResults([]);
  }

  function handleConfirm() {
    if (!selectedPlace) return;
    setError(null);
    const birthData = {
      date: birthDate,
      time: birthTime,
      location: selectedPlace.label,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      timezone: selectedPlace.timezone,
    };
    try {
      birthDataToUtcDate(birthData); // validates the conversion succeeds; recomputed on /chart
      saveLocalChart({ subjectName: subjectName.trim(), readingDepth, birthData });
      router.push("/chart");
    } catch {
      setError("Couldn't resolve that birth data. Check the date, time, and place.");
    }
  }

  const offsetLabel = selectedPlace
    ? formatOffset(tzOffsetMinutesAt(selectedPlace.timezone, birthDate && birthTime ? new Date(`${birthDate}T${birthTime}:00`) : new Date()))
    : null;

  return (
    <main className="fuxi-starfield flex-1 grid place-items-center p-10">
      <div style={{ width: 460, maxWidth: "100%" }}>
        <div style={{ display: "flex", gap: "var(--sp-4)", marginBottom: "var(--sp-8)" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 1, background: i <= step ? "var(--accent)" : "var(--border-hairline)" }} />
              <div
                className="fuxi-eyebrow"
                style={{ marginTop: "var(--sp-3)", color: i <= step ? "var(--text-accent)" : "var(--text-muted)" }}
              >
                {s}
              </div>
            </div>
          ))}
        </div>

        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)", marginBottom: "var(--sp-5)" }}>
          {step === 0 ? "Where and when did you begin?" : step === 1 ? "How deep should the reading go?" : "One last look"}
        </h1>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-muted)", maxWidth: "52ch" }}>
          {step === 0
            ? "Your chart is calculated from the exact moment and place of birth. Times to the minute give the most precise lines."
            : step === 1
              ? "Personality gates come from the moment of birth. Design gates come from roughly three months before it."
              : "You can change any of this later in settings."}
        </p>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)", marginTop: "var(--sp-7)" }}>
            <Input label="Name" placeholder="Whoever this chart is for" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-5)" }}>
              <Input label="Birth date" mono type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              <Input label="Birth time" mono type="time" hint="24-hour, local" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
            </div>
            <div style={{ position: "relative" }}>
              <Input
                label="Birthplace"
                placeholder="Amsterdam, NL"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                error={!selectedPlace && placeResults.length === 0 && placeQuery.trim().length >= 2 && !searching ? "No match found" : undefined}
              />
              {placeResults.length > 0 && (
                <Card
                  padding="var(--sp-2)"
                  style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "var(--sp-2)", zIndex: 10, display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {placeResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPlace(p)}
                      style={{
                        textAlign: "left",
                        background: "transparent",
                        border: 0,
                        padding: "var(--sp-3) var(--sp-4)",
                        font: "var(--type-body-sm)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        borderRadius: "var(--r-1)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </Card>
              )}
            </div>
            <Input
              label="Time zone"
              mono
              readOnly
              value={selectedPlace ? `${selectedPlace.timezone}${offsetLabel ? ` · ${offsetLabel}` : ""}` : ""}
              placeholder="Resolved from birthplace"
            />
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)", marginTop: "var(--sp-7)" }}>
            {READING_DEPTHS.map(({ key, title, detail }) => (
              <div
                key={key}
                onClick={() => setReadingDepth(key)}
                style={{
                  padding: "var(--sp-5)",
                  border: `1px solid ${readingDepth === key ? "var(--border-accent)" : "var(--border-hairline)"}`,
                  borderRadius: "var(--radius-card)",
                  background: readingDepth === key ? "var(--bg-active)" : "var(--surface-card)",
                  cursor: "pointer",
                  transition: "var(--motion-hover)",
                }}
              >
                <Radio label={title} checked={readingDepth === key} onChange={() => setReadingDepth(key)} />
                <div style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--text-muted)", marginTop: "var(--sp-2)", paddingLeft: 26 }}>
                  {detail}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && selectedPlace && (
          <div
            style={{
              marginTop: "var(--sp-7)",
              display: "flex",
              gap: "var(--sp-7)",
              alignItems: "center",
              padding: "var(--sp-7)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-card)",
              background: "var(--surface-card)",
            }}
          >
            <div>
              <div style={{ font: "var(--type-h3)", color: "var(--text-primary)" }}>{subjectName}</div>
              <div style={{ font: "var(--type-mono)", color: "var(--text-muted)", marginTop: "var(--sp-2)" }}>
                {birthDate} · {birthTime}
              </div>
              <div style={{ font: "var(--type-mono)", color: "var(--text-muted)", marginTop: "var(--sp-1)" }}>
                {selectedPlace.label} · {Math.abs(selectedPlace.latitude).toFixed(4)}°{selectedPlace.latitude < 0 ? "S" : "N"}{" "}
                {Math.abs(selectedPlace.longitude).toFixed(4)}°{selectedPlace.longitude < 0 ? "W" : "E"}
              </div>
            </div>
          </div>
        )}

        {error && <p style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--status-error)", marginTop: "var(--sp-5)" }}>{error}</p>}

        <div style={{ display: "flex", gap: "var(--sp-4)", marginTop: "var(--sp-8)" }}>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            size="lg"
            disabled={step === 0 && !canContinueStep0}
            onClick={() => (step === 2 ? handleConfirm() : setStep(step + 1))}
          >
            {step === 2 ? "Open my chart" : "Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}
