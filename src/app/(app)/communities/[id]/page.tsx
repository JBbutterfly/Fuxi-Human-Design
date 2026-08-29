"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { getCommunity, leaveCommunity, listCommunityMembers } from "@/lib/communities";
import { Badge, Button, Card } from "@/components/ui";
import type { Community, Membership } from "@/types";

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    Promise.all([getCommunity(id), listCommunityMembers(id)])
      .then(([c, m]) => {
        setCommunity(c);
        setMembers(m);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't load this community — you may not be a member.",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, id]);

  const me = members.find((m) => m.uid === user?.uid);

  async function handleLeave() {
    if (!user) return;
    await leaveCommunity(id, user.uid);
    router.replace("/dashboard");
  }

  const loadingEl = (
    <main className="flex-1 grid place-items-center p-8">
      <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
    </main>
  );

  if (loading) return loadingEl;
  if (error) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--status-error)" }}>{error}</p>
      </main>
    );
  }
  if (!community) return loadingEl;

  return (
    <main style={{ maxWidth: "var(--content-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>{community.name}</h1>

      {me?.role === "admin" && (
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
          Join code: <span style={{ font: "var(--type-mono)", letterSpacing: "var(--ls-mono)", color: "var(--text-accent)" }}>{community.joinCode}</span>
        </p>
      )}

      <section className="flex flex-col gap-3">
        <span className="fuxi-eyebrow">Members</span>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <Card key={m.id} padding="var(--sp-4) var(--sp-5)" className="flex items-center justify-between">
              <span style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{m.displayName}</span>
              <Badge tone={m.role === "admin" ? "gold" : "neutral"}>{m.role}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <Button variant="danger" size="sm" onClick={handleLeave} style={{ alignSelf: "flex-start" }}>
        Leave community
      </Button>
    </main>
  );
}
