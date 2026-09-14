"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { createNote, deleteNote, listMyNotes, updateNote } from "@/lib/notes";
import { Button, Card, Icon, Input, Textarea } from "@/components/ui";
import type { Note } from "@/types";

export default function NotesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectNote(note: Note | undefined) {
    setSelectedId(note?.id ?? null);
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
  }

  async function refresh(uid: string, selectId?: string) {
    const list = await listMyNotes(uid);
    setNotes(list);
    const toSelect = selectId ?? selectedId;
    selectNote(list.find((n) => n.id === toSelect) ?? list[0]);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    refresh(user.uid).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Couldn't load your notes.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function handleNew() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const noteId = await createNote(user.uid);
      await refresh(user.uid, noteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create a note.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!user || !selectedId) return;
    setBusy(true);
    setError(null);
    try {
      await updateNote(selectedId, { title, body });
      await refresh(user.uid, selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that note.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!user || !selectedId) return;
    setBusy(true);
    setError(null);
    try {
      await deleteNote(selectedId);
      await refresh(user.uid, undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that note.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p style={{ font: "var(--type-body)", color: "var(--text-secondary)" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "var(--content-max)" }} className="flex-1 w-full mx-auto p-8 flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h1 style={{ font: "var(--type-h1)", color: "var(--text-primary)" }}>Notes</h1>
        <Button size="sm" onClick={handleNew} disabled={busy} iconLeft={<Icon name="plus" size={14} />}>
          New note
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-7">
        <div className="flex flex-col gap-2">
          {notes.length === 0 && (
            <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
              No notes yet — create one to get started.
            </p>
          )}
          {notes.map((note) => (
            <Card
              key={note.id}
              interactive
              onClick={() => selectNote(note)}
              padding="var(--sp-3) var(--sp-4)"
              style={note.id === selectedId ? { border: "1px solid var(--border-accent)" } : undefined}
            >
              <span style={{ font: "var(--type-ui-sm)", color: "var(--text-primary)" }}>
                {note.title || "Untitled note"}
              </span>
            </Card>
          ))}
        </div>

        {selectedId ? (
          <div className="flex flex-col gap-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write here…" rows={14} />
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={busy}>
                {busy ? "Saving" : "Save"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={busy}
                iconLeft={<Icon name="trash-2" size={14} />}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-secondary)" }}>
            Create a note to get started.
          </p>
        )}
      </div>

      {error && <p style={{ font: "var(--type-ui-sm)", fontWeight: "var(--fw-regular)", color: "var(--status-error)" }}>{error}</p>}
    </main>
  );
}
