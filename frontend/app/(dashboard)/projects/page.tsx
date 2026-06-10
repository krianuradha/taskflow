'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/projects/ProjectCard';
import CreateProjectModal from '@/components/projects/CreateProjectModal';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-heading">All active workspaces</h1>
          <p className="mt-3 text-sm text-on-surface-variant">Create projects, invite members, and keep every task moving.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
          <Plus size={18} /> New Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[1.5rem] bg-surface" />
          ))}
        </div>
      ) : projects && projects.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-border-subtle bg-white p-10 text-center shadow-soft dark:border-[#1e3a5f] dark:bg-[#131b2e]">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Empty state</p>
          <h2 className="mt-4 text-2xl font-semibold text-text-heading">No projects yet</h2>
          <p className="mt-3 text-sm text-on-surface-variant">Start your first project to organize tasks, notes, and team members.</p>
          <button onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
            <Plus size={18} /> Create project
          </button>
        </div>
      )}

      <CreateProjectModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
