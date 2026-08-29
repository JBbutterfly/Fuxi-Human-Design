import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Community, Membership } from "@/types";

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
): Promise<{ communityId: string; joinCode: string }> {
  const communityRef = doc(collection(db, "communities"));
  const joinCode = generateJoinCode();
  const batch = writeBatch(db);

  batch.set(communityRef, {
    name,
    createdBy: uid,
    createdAt: serverTimestamp(),
    joinCode,
  });
  batch.set(doc(db, "joinCodes", joinCode), { communityId: communityRef.id });
  batch.set(doc(db, "memberships", membershipId(communityRef.id, uid)), {
    communityId: communityRef.id,
    uid,
    displayName,
    role: "admin",
    joinedAt: serverTimestamp(),
  });

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
