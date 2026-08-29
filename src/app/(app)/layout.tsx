"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { NavRail } from "@/components/app/NavRail";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
      </main>
    );
  }

  return (
    <div className="flex flex-1 min-h-0">
      <NavRail />
      <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">{children}</div>
    </div>
  );
}
