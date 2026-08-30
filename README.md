# Fuxi

Human Design + Astrology charts for communities and partners — families, extended kin,
and partner groups can create or join a private community and see cross-member chart
dynamics, without exposing anyone's data outside the communities they've actually joined.

This is a new, standalone project. It does not depend on, import from, or modify the
"Born Free Men" app in any way — that project is read-only reference material for
porting proven logic (the chart engine, the written content library, Connection Theory,
the PDF export approach) into this codebase's own design.

## Status

- **Working now, no Firebase needed:** the chart engine (real ephemeris via
  `astronomy-engine`, not a lookup table), the full 64-gate/36-channel content library,
  Type/Strategy/Authority/Profile/Definition/Incarnation Cross, the Five Elements Lens,
  BodyGraph SVG rendering, the birth-data onboarding wizard, and the gate library —
  all under `/chart`, `/chart/new`, `/gates`, `/elements`. Chart data persists to
  `localStorage` for now (`src/lib/localChart.ts`), swappable for Firestore later.
- **Working now, needs a Firebase project (or the emulators below):** auth, community
  create/join, membership-scoped Firestore rules — `/sign-in`, `/dashboard`,
  `/communities/[id]`.
- **Not built yet:** Connection Theory UI, PDF export UI, the full 64-gate hexagram line
  glyphs (needs verified King Wen line data, not yet sourced), multi-person/community
  chart comparison.

## Identity, communities, and access — the decisions this is built on

- **Identity**: Firebase Auth email-link (passwordless) sign-in. Persistent and
  recoverable, no passwords to manage.
- **Communities**: anyone signed in can create a community with a name of their choosing
  (e.g. "The Beall Family"), and becomes its first admin. Anyone can join an existing
  community using its join code. A person can belong to multiple communities at once.
- **Visibility**: joining a community means your chart is visible to every other member
  of that community, and vice versa — no per-member curation.
- **Data model**: `users`, `communities`, `memberships` (join docs, id
  `{communityId}_{uid}`), `charts` (private, owner-only), and
  `communities/{id}/sharedCharts/{uid}` (a published copy of a member's chart, readable
  by anyone else in that specific community). See `firestore.rules` for the full access
  rules and the reasoning behind this shape — in particular why cross-member visibility
  is implemented as a per-community published copy rather than a single global `charts`
  collection with a client-supplied "which communities can see this" field.

## Setting up your own Firebase project

This app needs its own Firebase project (Auth + Firestore) — one hasn't been created yet.

1. https://console.firebase.google.com → **Add project**.
2. **Build → Authentication → Get started** → enable the **Email link (passwordless
   sign-in)** provider.
3. **Build → Firestore Database → Create database** → start in **production mode** (the
   rules in `firestore.rules` are meant to be deployed, not bypassed with test-mode).
4. **Project settings → General → Your apps → Add app → Web** → copy the resulting config
   values into `.env.local` (copy `.env.local.example` as a starting point).
5. Deploy the security rules: `firebase deploy --only firestore:rules` (requires the
   [Firebase CLI](https://firebase.google.com/docs/cli) and `firebase init` to link this
   directory to your project first).

## Development without a real Firebase project

Firebase ships local emulators — a fully offline stand-in for Auth and Firestore, no
real project or credentials, nothing touches production. To develop or preview the
whole app (including sign-in and communities) without waiting on real Firebase setup:

```bash
npm install
cp .env.local.example .env.local
# edit .env.local: fill the six Firebase values with any non-empty placeholder,
# and set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true

npx firebase emulators:start   # separate terminal — Auth :9099, Firestore :8080, UI :4000
npm run dev
```

Open http://localhost:3000. Sign-in emails don't actually send; the Auth emulator's UI
(http://localhost:4000/auth) or its REST API exposes the generated link instead.

## Setting up a real Firebase project (for an actual deployment)

1. https://console.firebase.google.com → **Add project**.
2. **Build → Authentication → Get started** → enable the **Email link (passwordless
   sign-in)** provider.
3. **Build → Firestore Database → Create database** → start in **production mode** (the
   rules in `firestore.rules` are meant to be deployed, not bypassed with test-mode).
4. **Project settings → General → Your apps → Add app → Web** → copy the resulting config
   values into `.env.local` (copy `.env.local.example` as a starting point), and set
   `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`.
5. Deploy the security rules: `firebase deploy --only firestore:rules` (`firebase init`
   to link this directory to your project first, if you haven't).

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run lint` and `npx tsc --noEmit` should both pass clean
before pushing.
