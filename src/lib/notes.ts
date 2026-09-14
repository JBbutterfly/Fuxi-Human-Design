import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Note } from "@/types";

export async function listMyNotes(uid: string): Promise<Note[]> {
  const snap = await getDocs(query(collection(db, "notes"), where("ownerUid", "==", uid)));
  const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Note);
  // Sorted client-side rather than via an orderBy in the query: combining a where() with an
  // orderBy() on a different field needs a composite index, which would mean an extra manual
  // setup step in the Firebase console for a list this small.
  notes.sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
  return notes;
}

export async function createNote(uid: string): Promise<string> {
  const ref = doc(collection(db, "notes"));
  const now = serverTimestamp();
  await setDoc(ref, { ownerUid: uid, title: "Untitled note", body: "", createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateNote(noteId: string, fields: { title: string; body: string }) {
  await updateDoc(doc(db, "notes", noteId), { ...fields, updatedAt: serverTimestamp() });
}

export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, "notes", noteId));
}
