'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, SquareRoundedCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/hooks/useProject';
import { useProjectTasks, useCreateTask } from '@/hooks/useTasks';
import TaskCard from '@/components/tasks/TaskCard';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(8, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().min(1, 'Due date is required')
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { user, hasPermission } = useAuth();
  const { data: project } = useProject(projectId);
  const { data: tasks, isLoading } = useProjectTasks(projectId);
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'medium' }
  });

  const columns = useMemo(
    () => ({
      todo: tasks?.filter((task) => task.status === 'todo') ?? [],
      'in-progress': tasks?.filter((task) => task.status === 'in-progress') ?? [],
      done: tasks?.filter((task) => task.status === 'done') ?? []
    }),
    [tasks]
  );

  const onSubmit = async (values: TaskFormValues) => {
    await createTask.mutateAsync({
      title: values.title,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
      assigneeId: user?.id ?? '',
      status: 'todo'
    });
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Kanban board</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-heading">Project tasks</h1>
          <p className="mt-3 text-sm text-on-surface-variant">Organize work by status and assign items to the team.</p>
        </div>
        {hasPermission('manageTasks') && (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-96 rounded-[1.5rem] bg-surface p-6 shadow-soft animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {(['todo', 'in-progress', 'done'] as const).map((status) => (
            <section key={status} className="rounded-[1.75rem] bg-white p-6 shadow-soft dark:bg-[#131b2e]">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">{status === 'todo' ? 'To do' : status === 'in-progress' ? 'In progress' : 'Done'}</p>
                  <p className="text-2xl font-semibold text-text-heading">{columns[status].length}</p>
                </div>
                <span className="rounded-full bg-surface-container px-3 py-2 text-xs font-semibold text-on-surface">
                  {status === 'todo' ? 'Todo' : status === 'in-progress' ? 'Work' : 'Complete'}
                </span>
              </div>
              <div className="space-y-4">
                {columns[status].map((task) => (
                  <TaskCard key={task.id} projectId={projectId} task={task} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">New task</p>
                <h2 className="mt-2 text-2xl font-semibold text-text-heading">Add a task to the board</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-3 text-on-surface hover:bg-surface-container dark:hover:bg-[#152538]">
                <SquareRoundedCheck size={20} />
              </button>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-sm font-medium text-on-surface">Task name</label>
              <input className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]" {...register('title')} />
              {errors.title && <p className="text-sm text-error">{errors.title.message}</p>}

              <label className="block text-sm font-medium text-on-surface">Description</label>
              <textarea className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]" rows={4} {...register('description')} />
              {errors.description && <p className="text-sm text-error">{errors.description.message}</p>}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-on-surface">Priority</label>
                  <select className="mt-2 w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]" {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface">Due date</label>
                  <input className="mt-2 w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]" type="date" {...register('dueDate')} />
                  {errors.dueDate && <p className="text-sm text-error">{errors.dueDate.message}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-border-subtle px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? 'Creating…' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
