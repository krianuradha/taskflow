'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Clock, Copy, Tag, UploadCloud, MessageSquare, UserCheck, CheckCircle2 } from 'lucide-react';
import type { IAttachment, ISubtask, ITask } from '@/types';
import { taskPriorityLabel, taskStatusLabel, formatDate, progressValue } from '@/lib/utils';
import SubtaskItem from './SubtaskItem';
import AttachmentCard from './AttachmentCard';

interface TaskDetailViewProps {
  task: ITask;
  onToggleSubtask: (subtask: ISubtask) => void;
}

const feedEvents = [
  { label: 'Task created', author: 'Sofia Adams', date: 'Today', status: 'created' },
  { label: 'Subtask completed', author: 'Miguel Chen', date: '2h ago', status: 'progress' },
  { label: 'Attachment added', author: 'Ava Patel', date: 'Yesterday', status: 'attachment' }
];

export default function TaskDetailView({ task, onToggleSubtask }: TaskDetailViewProps) {
  const completedCount = task.subTasks.filter((item) => item.completed).length;
  const progress = progressValue(completedCount, task.subTasks.length);
  const [comment, setComment] = useState('');

  const statusBadge = useMemo(() => {
    const map = {
      todo: 'bg-status-todo/10 text-status-todo',
      'in-progress': 'bg-status-in-progress/10 text-status-in-progress',
      done: 'bg-status-done/10 text-status-done'
    };
    return map[task.status] ?? map.todo;
  }, [task.status]);

  return (
    <div className="grid gap-8 xl:grid-cols-[1.5fr_0.85fr]">
      <section className="space-y-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-secondary-container">Task Details</p>
              <h1 className="mt-3 text-3xl font-semibold text-text-heading">{task.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-2 text-sm font-semibold ${statusBadge}`}>{taskStatusLabel(task.status)}</span>
              <span className="rounded-full bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary">{taskPriorityLabel(task.priority)}</span>
            </div>
          </div>
          <p className="mt-8 text-base leading-7 text-on-surface-variant">{task.description}</p>
        </div>

        <div className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-secondary-container">Subtasks</p>
              <h2 className="mt-2 text-xl font-semibold text-text-heading">{completedCount}/{task.subTasks.length} completed</h2>
            </div>
            <div className="text-sm font-semibold text-on-surface-variant">{progress}%</div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-surface-container">
            <div className="h-3 rounded-2xl bg-secondary transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-3">
            {task.subTasks.map((subtask) => (
              <SubtaskItem key={subtask.id} subtask={subtask} onToggle={() => onToggleSubtask(subtask)} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-secondary-container">Attachments</p>
              <h2 className="mt-2 text-xl font-semibold text-text-heading">Project files</h2>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
              <UploadCloud size={16} /> Upload
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {task.attachments.map((attachment) => (
              <AttachmentCard key={attachment.id} attachment={attachment} />
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-border-subtle bg-white p-6 shadow-soft dark:border-[#1e3a5f] dark:bg-[#131b2e]">
          <p className="text-sm uppercase tracking-[0.32em] text-secondary-container">Metadata</p>
          <div className="mt-6 space-y-4">
            <div className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Assignee</span>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-secondary/10 text-secondary grid place-items-center text-base font-semibold">{task.assignee.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-text-heading">{task.assignee.name}</p>
                  <p className="text-sm text-on-surface-variant">{task.assignee.email}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-on-surface-variant">
              <div className="flex items-center gap-3">
                <CalendarDays />
                <span>Due {formatDate(task.dueDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock />
                <span>Updated {formatDate(task.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Copy className="w-5 h-5" />
                <span>Created {formatDate(task.createdAt)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-[#131b2e]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-secondary-container">Activity</p>
              <h2 className="mt-2 text-xl font-semibold text-text-heading">Recent updates</h2>
            </div>
          </div>
          <div className="space-y-4">
            {feedEvents.map((event) => (
              <div key={event.label} className="flex items-start gap-4 rounded-3xl border border-border-subtle bg-surface p-4 dark:border-[#1e3a5f] dark:bg-[#152538]">
                <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-secondary/10 text-secondary">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="font-semibold text-text-heading">{event.label}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{event.author} · {event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-[#131b2e]">
          <p className="text-sm uppercase tracking-[0.32em] text-secondary-container">Comment</p>
          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">A</div>
            <div className="flex-1 space-y-4">
              <textarea
                className="min-h-[110px] w-full rounded-3xl border border-border-subtle bg-surface p-4 text-sm text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-[#1e3a5f] dark:bg-[#152538]"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Leave a comment..."
              />
              <button className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
                <MessageSquare size={16} /> Post comment
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
