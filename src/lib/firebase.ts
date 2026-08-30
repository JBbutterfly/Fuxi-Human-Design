import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// Local Firebase emulators (Auth + Firestore) — no real Firebase project
// needed. Lets anyone develop or preview this app without waiting on real
// credentials: `firebase emulators:start` (see firebase.json/.firebaserc,
// both point at the "demo-" project id emulators treat as offline-only)
// plus NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true in .env.local. Never runs
// unless that flag is set, so it can't affect a real deployment.
//
// Guarded against Next's Fast Refresh re-running this module: the SDK
// throws if connectAuthEmulator/connectFirestoreEmulator are called twice
// on the same instance.
declare global {
  var __fuxiEmulatorsConnected__: boolean | undefined;
}

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
  !globalThis.__fuxiEmulatorsConnected__
) {
  globalThis.__fuxiEmulatorsConnected__ = true;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
