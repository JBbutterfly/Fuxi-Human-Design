"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { signOutUser, updateDisplayName } from "@/lib/auth";
import { useAuth } from "@/lib/AuthProvider";
import { Button, Card, Input } from "@/components/ui";
import type { UserProfile } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setDisplayName(profile.displayName);
        setEmail(profile.email);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await updateDisplayName(user.uid, displayName);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your name.");
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
    <main style={{ maxWidth: "var(--prose-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>Settings</h1>

      <Card as="form" onSubmit={handleSave} className="flex flex-col gap-4">
        <span className="fuxi-eyebrow">Profile</span>
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setSaved(false);
          }}
          required
        />
        <Input label="Email" value={email} disabled />
        <Button type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>
          {busy ? "Saving" : "Save"}
        </Button>
        {saved && <p style={{ font: "var(--type-ui-sm)", color: "var(--text-secondary)" }}>Saved.</p>}
        {error && <p style={{ font: "var(--type-ui-sm)", color: "var(--status-error)" }}>{error}</p>}
      </Card>

      <Card className="flex flex-col gap-4" style={{ alignItems: "flex-start" }}>
        <span className="fuxi-eyebrow">Account</span>
        <Button
          variant="danger"
          size="sm"
          onClick={() => signOutUser().then(() => router.replace("/sign-in"))}
        >
          Sign out
        </Button>
      </Card>
    </main>
  );
}
