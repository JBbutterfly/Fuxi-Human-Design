import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Firebase's email-link flow round-trips through the browser: we send a link, the person
// clicks it (possibly on a different device/session), and the app has to recover which
// email address that link was for. Firebase itself doesn't carry the email in the link,
// so it's cached here and re-prompted for only if that cache is gone (e.g. different device).
const PENDING_EMAIL_KEY = "fuxi:pendingSignInEmail";

export async function sendMagicLink(email: string) {
  const actionCodeSettings = {
    url: `${window.location.origin}/sign-in`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem(PENDING_EMAIL_KEY, email);
}

/**
 * Call on load of /sign-in. If the current URL is a valid sign-in link, completes the
 * sign-in and returns the resulting user. Otherwise returns null (nothing to do).
 */
export async function completeSignInFromLink(
  promptForEmail: () => Promise<string | null>,
): Promise<User | null> {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  let email = window.localStorage.getItem(PENDING_EMAIL_KEY);
  if (!email) {
    email = await promptForEmail();
  }
  if (!email) {
    return null;
  }

  const credential = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(PENDING_EMAIL_KEY);
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return;
  }
  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.email?.split("@")[0] ?? "Member",
    createdAt: serverTimestamp(),
  });
}

export async function signOutUser() {
  await signOut(auth);
}
