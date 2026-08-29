"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { completeSignInFromLink, sendMagicLink } from "@/lib/auth";
import { useAuth } from "@/lib/AuthProvider";

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
      router.replace("/dashboard");
      return;
    }
    setStatus("completing");
    completeSignInFromLink(async () => window.prompt("Confirm the email you signed in with:"))
      .then((signedInUser) => {
        if (signedInUser) {
          router.replace("/dashboard");
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
    return <main className="flex-1 grid place-items-center p-8">Signing you in…</main>;
  }

  if (status === "sent") {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p className="max-w-sm text-center">
          Check <strong>{email}</strong> for a sign-in link. Open it on this device to finish
          signing in.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 grid place-items-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Sign in to Fuxi</h1>
        <p className="text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a link to sign in — no password needed.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded bg-neutral-900 text-white px-3 py-2 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send sign-in link"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
