'use client';

import { useMemo, useState } from 'react';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import api from '@/lib/api';

export default function ProjectNotesPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { hasPermission } = useAuth();
  const { data: notes, isLoading } = useNotes(projectId);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const selected = useMemo(() => notes?.find((note) => note.id === selectedNote) ?? null, [notes, selectedNote]);

  const createNote = useMutation(
    async () => api.post(`/api/v1/notes/${projectId}`, { title, body }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes', projectId]);
        setOpen(false);
        setTitle('');
        setBody('');
      }
    }
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Project notes</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-heading">Knowledge base</h1>
          <p className="mt-3 text-sm text-on-surface-variant">Capture decisions, meeting notes, and important context.</p>
        </div>
        {hasPermission('manageNotes') && (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
            <Plus size={18} /> New Note
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-[2rem] bg-white p-10 shadow-soft dark:bg-[#131b2e]">Loading notes…</div>
      ) : notes?.length ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5">
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => setSelectedNote(note.id)}
                className="group rounded-[1.75rem] border border-border-subtle bg-white p-6 text-left shadow-soft transition hover:border-secondary/40 dark:border-[#1e3a5f] dark:bg-[#131b2e]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-secondary-container">Note</p>
                    <h2 className="mt-3 text-xl font-semibold text-text-heading">{note.title}</h2>
                  </div>
                  <FileText size={24} className="text-secondary" />
                </div>
                <p className="mt-4 text-sm leading-6 text-on-surface-variant">{note.body.slice(0, 140)}...</p>
                <div className="mt-6 flex items-center justify-between text-sm text-on-surface-variant">
                  <span>{note.author.name}</span>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="rounded-[2rem] bg-surface-container p-6 shadow-soft dark:bg-[#152538]">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Preview</p>
            {selected ? (
              <div className="mt-6 space-y-5">
                <h2 className="text-2xl font-semibold text-text-heading">{selected.title}</h2>
                <p className="text-sm leading-7 text-on-surface-variant">{selected.body}</p>
              </div>
            ) : (
              <div className="mt-6 text-sm text-on-surface-variant">Select a note to review the full content or create a new note if you have permission.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-border-subtle bg-white p-10 text-center shadow-soft dark:border-[#1e3a5f] dark:bg-[#131b2e]">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">No notes yet</p>
          <h2 className="mt-4 text-2xl font-semibold text-text-heading">Record your first note</h2>
          <p className="mt-3 text-sm text-on-surface-variant">Use notes to keep the team aligned and preserve decisions.</p>
          {hasPermission('manageNotes') && (
            <button onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
              <Plus size={18} /> Add note
            </button>
          )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">New note</p>
                <h2 className="mt-2 text-2xl font-semibold text-text-heading">Capture insight or meeting notes</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-3 text-on-surface hover:bg-surface-container dark:hover:bg-[#152538]">×</button>
            </div>
            <div className="space-y-5">
              <label className="block text-sm font-medium text-on-surface">Title</label>
              <input
                className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <label className="block text-sm font-medium text-on-surface">Body</label>
              <textarea
                className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                rows={8}
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-border-subtle px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => createNote.mutate()}
                  disabled={createNote.isLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save note <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
