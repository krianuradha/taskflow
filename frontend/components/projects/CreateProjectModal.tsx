'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateProject } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutateAsync, isPending } = useCreateProject();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mutateAsync({ name, description });
    setName('');
    setDescription('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-heading">New project</h2>
            <p className="text-sm text-on-surface-variant">Define a project name and description for the team.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-on-surface hover:bg-surface-container dark:hover:bg-[#152538]">
            <X size={18} />
          </button>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-on-surface">Project name</label>
          <input
            className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <label className="block text-sm font-medium text-on-surface">Description</label>
          <textarea
            className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            required
          />
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-border-subtle px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn('rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]', isPending && 'opacity-60')}
            >
              {isPending ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
