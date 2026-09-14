"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    // Bootstrapping the users/{uid} profile doc here, rather than in each sign-in method's
    // own completion code, avoids a real race on the Google-redirect path: when the page
    // reloads after the redirect back from Google, this listener routinely resolves before
    // our own getRedirectResult() call does, so a page that redirects away as soon as
    // `user` is set (as /sign-in does) would otherwise skip the profile bootstrap entirely.
    // ensureUserProfile is a no-op if the doc already exists, so calling it on every
    // sign-in (any method) and page load is cheap and safe.
    return onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false });
      if (user) {
        void ensureUserProfile(user);
      }
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
