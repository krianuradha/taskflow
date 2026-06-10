'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { cn } from '@/lib/utils';

const tabs = [
  { href: 'tasks', label: 'Tasks' },
  { href: 'members', label: 'Members' },
  { href: 'notes', label: 'Notes' }
];

export default function ProjectOverviewPage() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.projectId as string;
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">Loading project…</div>;
  }

  if (!project) {
    return <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft dark:bg-[#131b2e]">Project not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Project</p>
            <h1 className="mt-3 text-3xl font-semibold text-text-heading">{project.name}</h1>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{project.description}</p>
          </div>
          <div className="rounded-3xl bg-surface-container p-4 text-sm text-on-surface-variant dark:bg-[#152538]">
            <p className="font-semibold text-text-heading">{project.members.length} members</p>
            <p>{project.taskCount} tasks</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-[#131b2e]">
        <nav className="flex flex-wrap gap-3 px-4 py-3">
          {tabs.map((tab) => {
            const href = `/projects/${projectId}/${tab.href}`;
            const isActive = pathname === href;
            return (
              <Link
                key={tab.href}
                href={href}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-secondary text-white' : 'bg-surface text-on-surface hover:bg-surface-container dark:bg-[#152538] dark:text-white'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Overview</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-surface-container p-6 dark:bg-[#152538]">
            <p className="text-sm text-on-surface-variant">Members</p>
            <p className="mt-3 text-3xl font-semibold text-text-heading">{project.members.length}</p>
          </div>
          <div className="rounded-3xl bg-surface-container p-6 dark:bg-[#152538]">
            <p className="text-sm text-on-surface-variant">Tasks</p>
            <p className="mt-3 text-3xl font-semibold text-text-heading">{project.taskCount}</p>
          </div>
          <div className="rounded-3xl bg-surface-container p-6 dark:bg-[#152538]">
            <p className="text-sm text-on-surface-variant">Completed</p>
            <p className="mt-3 text-3xl font-semibold text-text-heading">{project.completedTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
