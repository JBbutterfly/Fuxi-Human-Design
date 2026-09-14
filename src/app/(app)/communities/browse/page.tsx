"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { listMyMemberships, listVisibleCommunities, requestToJoin } from "@/lib/communities";
import { db } from "@/lib/firebase";
import { Badge, Button, Card, Icon } from "@/components/ui";
import type { Community, UserProfile } from "@/types";

export default function BrowseCommunitiesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState("Member");
  const [communities, setCommunities] = useState<Community[] | null>(null);
  const [myCommunityIds, setMyCommunityIds] = useState<Set<string>>(new Set());
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    Promise.all([listVisibleCommunities(), listMyMemberships(user.uid), getDoc(doc(db, "users", user.uid))])
      .then(([visible, memberships, profileSnap]) => {
        setCommunities(visible);
        setMyCommunityIds(new Set(memberships.map((m) => m.communityId)));
        if (profileSnap.exists()) {
          setDisplayName((profileSnap.data() as UserProfile).displayName);
        }
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't load the directory — join or create a community first to browse others.",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function handleRequest(communityId: string) {
    if (!user) return;
    setBusyId(communityId);
    setError(null);
    try {
      await requestToJoin(communityId, user.uid, displayName);
      setRequested((prev) => new Set(prev).add(communityId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that request.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !user) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "var(--content-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" style={{ borderBottom: "none", display: "inline-flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <Icon name="arrow-left" size={15} color="var(--text-muted)" />
          <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>Dashboard</span>
        </Link>
      </div>

      <div>
        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>Browse communities</h1>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)", marginTop: "var(--sp-2)" }}>
          Communities that have chosen to be visible. Request to join one — an admin has to approve you first.
        </p>
      </div>

      {error && <p style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--status-error)" }}>{error}</p>}

      {communities === null ? null : communities.length === 0 ? (
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
          No visible communities yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {communities.map((c) => {
            const isMember = myCommunityIds.has(c.id);
            const hasRequested = requested.has(c.id);
            return (
              <Card key={c.id} className="flex items-center justify-between gap-4">
                <span style={{ font: "var(--type-ui)", color: "var(--text-primary)" }}>{c.name}</span>
                {isMember ? (
                  <Link href={`/communities/view?id=${c.id}`} style={{ borderBottom: "none" }}>
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </Link>
                ) : hasRequested ? (
                  <Badge tone="neutral">Requested</Badge>
                ) : (
                  <Button size="sm" disabled={busyId === c.id} onClick={() => handleRequest(c.id)}>
                    Request to join
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
