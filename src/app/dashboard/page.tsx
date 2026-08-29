"use client";

import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { createCommunity, joinCommunityByCode, listMyMemberships } from "@/lib/communities";
import { db } from "@/lib/firebase";
import { signOutUser } from "@/lib/auth";
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
    return <main className="flex-1 grid place-items-center p-8">Loading…</main>;
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {profile ? `Welcome, ${profile.displayName}` : "Welcome"}
        </h1>
        <button onClick={() => signOutUser().then(() => router.replace("/sign-in"))} className="text-sm text-neutral-500">
          Sign out
        </button>
      </div>

      <section>
        <h2 className="font-medium mb-2">Your communities</h2>
        {memberships.length === 0 ? (
          <p className="text-sm text-neutral-500">You&apos;re not in any communities yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {memberships.map((m) => (
              <li key={m.id}>
                <Link href={`/communities/${m.communityId}`} className="underline">
                  {m.communityId}
                </Link>{" "}
                <span className="text-xs text-neutral-500">({m.role})</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <h2 className="font-medium">Create a community</h2>
          <input
            required
            value={newCommunityName}
            onChange={(e) => setNewCommunityName(e.target.value)}
            placeholder="e.g. The Beall Family"
            className="rounded border px-3 py-2"
          />
          <button disabled={busy} className="rounded bg-neutral-900 text-white px-3 py-2 disabled:opacity-50">
            Create
          </button>
        </form>

        <form onSubmit={handleJoin} className="flex flex-col gap-2">
          <h2 className="font-medium">Join with a code</h2>
          <input
            required
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Join code"
            className="rounded border px-3 py-2"
          />
          <button disabled={busy} className="rounded bg-neutral-900 text-white px-3 py-2 disabled:opacity-50">
            Join
          </button>
        </form>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
