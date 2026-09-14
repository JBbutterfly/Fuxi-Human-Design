"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import {
  approveJoinRequest,
  denyJoinRequest,
  getCommunity,
  leaveCommunity,
  listCommunityMembers,
  listJoinRequests,
} from "@/lib/communities";
import { ChartReport } from "@/components/chart/ChartReport";
import { loadLocalChart } from "@/lib/localChart";
import { Badge, Button, Card } from "@/components/ui";
import type { Community, JoinRequest, Membership } from "@/types";

function CommunityView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { user, loading } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [requestBusyId, setRequestBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myChart = loadLocalChart();
  const me = members.find((m) => m.uid === user?.uid);
  const isAdmin = me?.role === "admin";

  function refreshRequests() {
    if (!id) return;
    listJoinRequests(id)
      .then(setJoinRequests)
      .catch(() => {
        // Not an admin, or nothing to see — the members-only view doesn't need this list.
      });
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (!id) {
      setError("No community specified.");
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

  useEffect(() => {
    if (isAdmin) refreshRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, id]);

  async function handleLeave() {
    if (!user || !id) return;
    await leaveCommunity(id, user.uid);
    router.replace("/dashboard");
  }

  async function handleApprove(req: JoinRequest) {
    if (!id) return;
    setRequestBusyId(req.id);
    try {
      await approveJoinRequest(id, req.uid, req.displayName);
      const [m, r] = await Promise.all([listCommunityMembers(id), listJoinRequests(id)]);
      setMembers(m);
      setJoinRequests(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't approve that request.");
    } finally {
      setRequestBusyId(null);
    }
  }

  async function handleDeny(req: JoinRequest) {
    if (!id) return;
    setRequestBusyId(req.id);
    try {
      await denyJoinRequest(id, req.uid);
      setJoinRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't deny that request.");
    } finally {
      setRequestBusyId(null);
    }
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
    <main style={{ maxWidth: "var(--content-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-9">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>{community.name}</h1>
        <Badge tone={community.visibility === "visible" ? "jade" : "neutral"}>
          {community.visibility === "visible" ? "Visible" : "Private"}
        </Badge>
      </div>

      {isAdmin && (
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
          Join code: <span style={{ font: "var(--type-mono)", letterSpacing: "var(--ls-mono)", color: "var(--text-accent)" }}>{community.joinCode}</span>
        </p>
      )}

      {isAdmin && joinRequests.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className="fuxi-eyebrow">Join requests</span>
          <div className="flex flex-col gap-2">
            {joinRequests.map((req) => (
              <Card key={req.id} padding="var(--sp-4) var(--sp-5)" className="flex items-center justify-between gap-4">
                <span style={{ font: "var(--type-body-sm)", color: "var(--text-primary)" }}>{req.displayName}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" disabled={requestBusyId === req.id} onClick={() => handleApprove(req)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={requestBusyId === req.id}
                    onClick={() => handleDeny(req)}
                  >
                    Deny
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
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

      <section className="flex flex-col gap-4">
        <span className="fuxi-eyebrow">My chart</span>
        {myChart ? (
          <ChartReport input={myChart} showNewChartLink={false} />
        ) : (
          <Card className="flex items-center justify-between gap-4">
            <span style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
              You haven&apos;t created a chart yet.
            </span>
            <Link href="/chart/new" style={{ borderBottom: "none" }}>
              <Button size="sm">Create your chart</Button>
            </Link>
          </Card>
        )}
      </section>

      <Button variant="danger" size="sm" onClick={handleLeave} style={{ alignSelf: "flex-start" }}>
        Leave community
      </Button>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 grid place-items-center p-8">
          <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
        </main>
      }
    >
      <CommunityView />
    </Suspense>
  );
}
