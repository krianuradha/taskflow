'use client';

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ISubtask } from '@/types';

interface SubtaskItemProps {
  subtask: ISubtask;
  onToggle: () => void;
}

export default function SubtaskItem({ subtask, onToggle }: SubtaskItemProps) {
  const classes = useMemo(
    () =>
      `flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
        subtask.completed
          ? 'border-secondary/30 bg-secondary/10 text-secondary line-through'
          : 'border-border-subtle bg-white text-on-surface dark:border-[#1e3a5f] dark:bg-[#131b2e]'
      }`,
    [subtask.completed]
  );

  return (
    <button type="button" onClick={onToggle} className={classes}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-surface text-on-surface transition dark:border-[#1e3a5f] dark:bg-[#152538]">
        {subtask.completed ? <CheckCircle2 size={16} /> : <span className="h-2.5 w-2.5 rounded-full bg-border-subtle" />}
      </span>
      <span className="text-sm font-medium">{subtask.title}</span>
    </button>
  );
}
