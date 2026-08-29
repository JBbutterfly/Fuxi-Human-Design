"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { getCommunity, leaveCommunity, listCommunityMembers } from "@/lib/communities";
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

  if (loading) return <main className="flex-1 grid place-items-center p-8">Loading…</main>;
  if (error) return <main className="flex-1 grid place-items-center p-8 text-red-600">{error}</main>;
  if (!community) return <main className="flex-1 grid place-items-center p-8">Loading…</main>;

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full p-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{community.name}</h1>

      {me?.role === "admin" && (
        <p className="text-sm text-neutral-500">
          Join code: <code className="font-mono">{community.joinCode}</code>
        </p>
      )}

      <section>
        <h2 className="font-medium mb-2">Members</h2>
        <ul className="flex flex-col gap-1">
          {members.map((m) => (
            <li key={m.id} className="text-sm">
              {m.displayName} <span className="text-xs text-neutral-500">({m.role})</span>
            </li>
          ))}
        </ul>
      </section>

      <button onClick={handleLeave} className="text-sm text-red-600 self-start">
        Leave community
      </button>
    </main>
  );
}
