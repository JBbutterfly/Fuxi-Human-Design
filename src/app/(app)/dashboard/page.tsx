"use client";

import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { createCommunity, joinCommunityByCode, listMyMemberships } from "@/lib/communities";
import { db } from "@/lib/firebase";
import { signOutUser } from "@/lib/auth";
import { Button, Card, Input } from "@/components/ui";
import type { Membership, UserProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  async function refresh(uid: string) {
    const [profileSnap, myMemberships] = await Promise.all([
      getDoc(doc(db, "users", uid)),
      listMyMemberships(uid),
    ]);
    setProfile(profileSnap.exists() ? (profileSnap.data() as UserProfile) : null);
    setMemberships(myMemberships);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    void refresh(user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setBusy(true);
    setError(null);
    try {
      const { communityId } = await createCommunity(newCommunityName, user.uid, profile.displayName);
      router.push(`/communities/${communityId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that community.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setBusy(true);
    setError(null);
    try {
      const { communityId } = await joinCommunityByCode(joinCode, user.uid, profile.displayName);
      router.push(`/communities/${communityId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join with that code.");
    } finally {
      setBusy(false);
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
    <main style={{ maxWidth: "var(--content-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-9">
      <div className="flex items-center justify-between">
        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>
          {profile ? profile.displayName : "Welcome"}
        </h1>
        <button
          onClick={() => signOutUser().then(() => router.replace("/sign-in"))}
          style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)", background: "none", border: 0, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <span className="fuxi-eyebrow">Your communities</span>
        {memberships.length === 0 ? (
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
            Not in any communities yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {memberships.map((m) => (
              <Link key={m.id} href={`/communities/${m.communityId}`} style={{ borderBottom: "none" }}>
                <Card interactive className="flex items-center justify-between">
                  <span style={{ font: "var(--type-ui)", color: "var(--text-primary)" }}>{m.communityId}</span>
                  <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>{m.role}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-7">
        <Card as="form" onSubmit={handleCreate} className="flex flex-col gap-4">
          <span className="fuxi-eyebrow">Create a community</span>
          <Input
            required
            value={newCommunityName}
            onChange={(e) => setNewCommunityName(e.target.value)}
            placeholder="e.g. The Beall family"
          />
          <Button type="submit" disabled={busy}>
            Create
          </Button>
        </Card>

        <Card as="form" onSubmit={handleJoin} className="flex flex-col gap-4">
          <span className="fuxi-eyebrow">Join with a code</span>
          <Input
            required
            mono
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Join code"
          />
          <Button type="submit" variant="jade" disabled={busy}>
            Join
          </Button>
        </Card>
      </section>

      {error && <p style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--status-error)" }}>{error}</p>}
    </main>
  );
}
