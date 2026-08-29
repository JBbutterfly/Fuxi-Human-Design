"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { completeSignInFromLink, sendMagicLink } from "@/lib/auth";
import { useAuth } from "@/lib/AuthProvider";
import { Button, Input } from "@/components/ui";

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "completing" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/chart");
      return;
    }
    setStatus("completing");
    completeSignInFromLink(async () => window.prompt("Confirm the email you signed in with:"))
      .then((signedInUser) => {
        if (signedInUser) {
          router.replace("/chart");
        } else {
          setStatus("idle");
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "That sign-in link didn't work.");
        setStatus("error");
      });
    // Only re-run this on auth-state settling, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await sendMagicLink(email);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that link. Try again.");
      setStatus("error");
    }
  }

  if (status === "completing") {
    return (
      <main className="fuxi-starfield flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Signing you in…</p>
      </main>
    );
  }

  if (status === "sent") {
    return (
      <main className="fuxi-starfield flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)", maxWidth: 360, textAlign: "center" }}>
          Check <strong style={{ color: "var(--text-primary)" }}>{email}</strong> for a sign-in link. Open it on
          this device to finish signing in.
        </p>
      </main>
    );
  }

  return (
    <main className="fuxi-starfield flex-1 grid place-items-center p-8">
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>Sign in to Fuxi</h1>
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
            Enter your email and we&apos;ll send you a link to sign in. No password.
          </p>
        </div>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Button type="submit" disabled={status === "sending"} fullWidth>
          {status === "sending" ? "Sending" : "Send sign-in link"}
        </Button>
        {error && <p style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--status-error)" }}>{error}</p>}
      </form>
    </main>
  );
}
