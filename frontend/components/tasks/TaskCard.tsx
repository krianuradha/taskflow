'use client';

import Link from 'next/link';
import { Clock, CheckCircle2, UserPlus } from 'lucide-react';
import type { ITask } from '@/types';
import { taskPriorityLabel, taskStatusLabel } from '@/lib/utils';

interface TaskCardProps {
  projectId: string;
  task: ITask;
}

const statusColors: Record<string, string> = {
  todo: 'bg-status-todo/10 text-status-todo',
  'in-progress': 'bg-status-in-progress/10 text-status-in-progress',
  done: 'bg-status-done/10 text-status-done'
};

export default function TaskCard({ projectId, task }: TaskCardProps) {
  return (
    <Link href={`/projects/${projectId}/tasks/${task.id}`} className="group block rounded-[1.5rem] border border-border-subtle bg-white p-5 shadow-soft transition hover:border-secondary/40 dark:bg-[#131b2e]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[task.status]}`}>{taskStatusLabel(task.status)}</span>
        <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary">{taskPriorityLabel(task.priority)}</span>
      </div>
      <h3 className="mb-3 text-lg font-semibold text-text-heading">{task.title}</h3>
      <p className="text-sm leading-6 text-on-surface-variant">{task.description}</p>
      <div className="mt-5 flex items-center justify-between text-xs text-on-surface-variant">
        <span className="flex items-center gap-1"><UserPlus size={14} /> {task.assignee?.name || 'Unassigned'}</span>
        <span className="flex items-center gap-1"><Clock size={14} />{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
        <CheckCircle2 size={14} /> {task.subTasks.length} subtasks
      </div>
    </Link>
  );
}
