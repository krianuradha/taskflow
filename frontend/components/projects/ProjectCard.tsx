'use client';

import Link from 'next/link';
import type { IProject } from '@/types';
import { progressValue } from '@/lib/utils';

interface ProjectCardProps {
  project: IProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const progress = progressValue(project.completedTasks, project.taskCount);

  return (
    <Link href={`/projects/${project.id}`} className="group block rounded-[1.5rem] border border-border-subtle bg-white p-6 shadow-soft transition hover:border-secondary/40 hover:shadow-lg dark:bg-[#131b2e]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-secondary-container">Project</p>
          <h2 className="mt-3 text-xl font-semibold text-text-heading">{project.name}</h2>
        </div>
        <div className="rounded-2xl bg-secondary px-3 py-2 text-sm font-semibold text-white">{(project.members?.length ?? project.memberCount ?? 0)} members</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-on-surface-variant">{project.description}</p>
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>{progress}% complete</span>
          <span>{project.taskCount} tasks</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-container">
          <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Link>
  );
}
