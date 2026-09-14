import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Community, CommunityVisibility, JoinRequest, Membership, UserProfile } from "@/types";

// Characters chosen to avoid visual ambiguity when someone reads a code aloud or copies
// it by hand (no 0/O, 1/I/L).
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function generateJoinCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function membershipId(communityId: string, uid: string) {
  return `${communityId}_${uid}`;
}

export async function createCommunity(
  name: string,
  uid: string,
  displayName: string,
  visibility: CommunityVisibility,
): Promise<{ communityId: string; joinCode: string }> {
  const communityRef = doc(collection(db, "communities"));
  const joinCode = generateJoinCode();
  const batch = writeBatch(db);

  batch.set(communityRef, {
    name,
    createdBy: uid,
    createdAt: serverTimestamp(),
    joinCode,
    visibility,
  });
  batch.set(doc(db, "joinCodes", joinCode), { communityId: communityRef.id });
  batch.set(doc(db, "memberships", membershipId(communityRef.id, uid)), {
    communityId: communityRef.id,
    uid,
    displayName,
    role: "admin",
    joinedAt: serverTimestamp(),
  });
  batch.set(doc(db, "users", uid), { hasCommunity: true }, { merge: true });

  await batch.commit();
  return { communityId: communityRef.id, joinCode };
}

export async function joinCommunityByCode(
  code: string,
  uid: string,
  displayName: string,
): Promise<{ communityId: string; alreadyMember: boolean }> {
  const normalized = code.trim().toUpperCase();
  const codeSnap = await getDoc(doc(db, "joinCodes", normalized));
  if (!codeSnap.exists()) {
    throw new Error("That code doesn't match any community. Double-check it and try again.");
  }
  const { communityId } = codeSnap.data() as { communityId: string };

  const membershipRef = doc(db, "memberships", membershipId(communityId, uid));
  const existing = await getDoc(membershipRef);
  if (existing.exists()) {
    return { communityId, alreadyMember: true };
  }

  const batch = writeBatch(db);
  batch.set(membershipRef, {
    communityId,
    uid,
    displayName,
    role: "member",
    joinedAt: serverTimestamp(),
  });
  batch.set(doc(db, "users", uid), { hasCommunity: true }, { merge: true });
  await batch.commit();
  return { communityId, alreadyMember: false };
}

export async function listMyMemberships(uid: string): Promise<Membership[]> {
  const snap = await getDocs(query(collection(db, "memberships"), where("uid", "==", uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Membership);
}

export async function getCommunity(communityId: string): Promise<Community | null> {
  const snap = await getDoc(doc(db, "communities", communityId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Community) : null;
}

export async function listCommunityMembers(communityId: string): Promise<Membership[]> {
  const snap = await getDocs(
    query(collection(db, "memberships"), where("communityId", "==", communityId)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Membership);
}

export async function listVisibleCommunities(): Promise<Community[]> {
  const snap = await getDocs(query(collection(db, "communities"), where("visibility", "==", "visible")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Community);
}

export async function requestToJoin(communityId: string, uid: string, displayName: string) {
  await setDoc(doc(db, "communities", communityId, "joinRequests", uid), {
    uid,
    displayName,
    requestedAt: serverTimestamp(),
  });
}

export async function cancelJoinRequest(communityId: string, uid: string) {
  await deleteDoc(doc(db, "communities", communityId, "joinRequests", uid));
}

export async function listJoinRequests(communityId: string): Promise<JoinRequest[]> {
  const snap = await getDocs(collection(db, "communities", communityId, "joinRequests"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JoinRequest);
}

export async function approveJoinRequest(communityId: string, uid: string, displayName: string) {
  const batch = writeBatch(db);
  batch.set(doc(db, "memberships", membershipId(communityId, uid)), {
    communityId,
    uid,
    displayName,
    role: "member",
    joinedAt: serverTimestamp(),
  });
  batch.delete(doc(db, "communities", communityId, "joinRequests", uid));
  await batch.commit();
}

export async function denyJoinRequest(communityId: string, uid: string) {
  await deleteDoc(doc(db, "communities", communityId, "joinRequests", uid));
}

// An admin approving a join request can create the new member's membership doc, but can't
// write to that member's own users/{uid} profile (self-write-only, see firestore.rules) to
// flip their hasCommunity flag. So the newly-approved member's own client self-heals it here
// next time it loads somewhere that already fetches their memberships.
export async function ensureHasCommunityFlag(uid: string) {
  const memberships = await listMyMemberships(uid);
  if (memberships.length === 0) return;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists() && (snap.data() as UserProfile).hasCommunity) return;
  await setDoc(ref, { hasCommunity: true }, { merge: true });
}

export async function leaveCommunity(communityId: string, uid: string) {
  // Batched (not two sequential deletes): the sharedCharts delete rule requires the
  // caller to still be a member, and a batch's rule checks all see the pre-batch state,
  // so this succeeds regardless of write order. Two separate calls would not — the second
  // would see the membership already gone.
  const batch = writeBatch(db);
  batch.delete(doc(db, "memberships", membershipId(communityId, uid)));
  batch.delete(doc(db, "communities", communityId, "sharedCharts", uid));
  await batch.commit();
}
