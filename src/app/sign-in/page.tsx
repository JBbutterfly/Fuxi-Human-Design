"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { completeGoogleRedirect, completeSignInFromLink, sendMagicLink, signInWithGoogle } from "@/lib/auth";
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
    (async () => {
      try {
        const linkUser = await completeSignInFromLink(async () =>
          window.prompt("Confirm the email you signed in with:"),
        );
        if (linkUser) {
          router.replace("/chart");
          return;
        }
        const googleUser = await completeGoogleRedirect();
        if (googleUser) {
          router.replace("/chart");
          return;
        }
        setStatus("idle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "That sign-in didn't work.");
        setStatus("error");
      }
    })();
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

  async function handleGoogleSignIn() {
    setStatus("sending");
    setError(null);
    try {
      // Navigates away to Google's sign-in page; completion is handled by
      // completeGoogleRedirect() in the effect above when the browser returns here.
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in with Google. Try again.");
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

        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-hairline)" }} />
          <span style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-hairline)" }} />
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={status === "sending"}
          onClick={handleGoogleSignIn}
          fullWidth
        >
          Continue with Google
        </Button>
      </form>
    </main>
  );
}
