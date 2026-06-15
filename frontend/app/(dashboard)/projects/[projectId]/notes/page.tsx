'use client';

import { useMemo, useState } from 'react';
import { Plus, FileText, Pencil, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useProjectRole } from '@/hooks/useProjectRole';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ProjectNotesPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { hasPermission } = useAuth();
  const projectRole = useProjectRole(projectId);
  const { data: notes, isLoading } = useNotes(projectId);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<{ id: string; title: string; body: string } | null>(null);

  const selected = useMemo(() => notes?.find((note) => note.id === selectedNote) ?? null, [notes, selectedNote]);

  const createNote = useMutation({
    mutationFn: async () => api.post(`/api/v1/notes/${projectId}`, { title, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      setOpen(false);
      setTitle('');
      setBody('');
      toast.success('Note created successfully');
    },
    onError: () => toast.error('Failed to create note'),
  });

  const updateNote = useMutation({
    mutationFn: async (note: { id: string; title: string; body: string }) =>
      api.put(`/api/v1/notes/${projectId}/n/${note.id}`, { title: note.title, body: note.body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      setEditNote(null);
      toast.success('Note updated');
    },
    onError: () => toast.error('Failed to update note'),
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) =>
      api.delete(`/api/v1/notes/${projectId}/n/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      setSelectedNote(null);
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const canManage = hasPermission('manageNotes', projectRole);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Project notes</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-heading">Knowledge base</h1>
          <p className="mt-3 text-sm text-on-surface-variant">Capture decisions, meeting notes, and important context.</p>
        </div>
        {canManage && (
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
              <div
                key={note.id}
                onClick={() => setSelectedNote(note.id)}
                className="group cursor-pointer rounded-[1.75rem] border border-border-subtle bg-white p-6 text-left shadow-soft transition hover:border-secondary/40 dark:border-[#1e3a5f] dark:bg-[#131b2e]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm uppercase tracking-[0.25em] text-secondary-container">Note</p>
                    <h2 className="mt-3 text-xl font-semibold text-text-heading truncate">{note.title}</h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {canManage && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditNote({ id: note.id, title: note.title, body: note.body });
                          }}
                          className="rounded-xl p-2 text-on-surface-variant opacity-0 transition group-hover:opacity-100 hover:bg-surface-container dark:hover:bg-[#152538]"
                          title="Edit note"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this note?')) deleteNote.mutate(note.id);
                          }}
                          className="rounded-xl p-2 text-on-surface-variant opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                          title="Delete note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    <FileText size={24} className="text-secondary" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                  {note.body.length > 140 ? `${note.body.slice(0, 140)}...` : note.body}
                </p>
                <div className="mt-6 flex items-center justify-between text-sm text-on-surface-variant">
                  <span>{note.author.name}</span>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[2rem] bg-surface-container p-6 shadow-soft dark:bg-[#152538]">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Preview</p>
            {selected ? (
              <div className="mt-6 space-y-5">
                <h2 className="text-2xl font-semibold text-text-heading">{selected.title}</h2>
                <p className="text-sm leading-7 text-on-surface-variant whitespace-pre-wrap">{selected.body}</p>
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
          {canManage && (
            <button onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
              <Plus size={18} /> Add note
            </button>
          )}
        </div>
      )}

      {/* Create Note Modal */}
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
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
                <input
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Meeting notes, decisions…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Body</label>
                <textarea
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                  rows={8}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write your note here…"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-border-subtle px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => createNote.mutate()}
                  disabled={createNote.isPending || !title.trim() || !body.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createNote.isPending ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editNote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Edit note</p>
                <h2 className="mt-2 text-2xl font-semibold text-text-heading">Update note content</h2>
              </div>
              <button onClick={() => setEditNote(null)} className="rounded-full p-3 text-on-surface hover:bg-surface-container dark:hover:bg-[#152538]">×</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
                <input
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                  value={editNote.title}
                  onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Body</label>
                <textarea
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                  rows={8}
                  value={editNote.body}
                  onChange={(e) => setEditNote({ ...editNote, body: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEditNote(null)} className="rounded-2xl border border-border-subtle px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => updateNote.mutate(editNote)}
                  disabled={updateNote.isPending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateNote.isPending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
