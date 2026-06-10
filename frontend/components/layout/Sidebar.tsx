'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IUser } from '@/types';

interface SidebarProps {
  user?: IUser | null;
  loading: boolean;
}

const navItems = [{ href: '/projects', label: 'Projects' }];

export default function Sidebar({ user, loading }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[280px] flex-col border-r border-border-subtle bg-white px-6 py-8 shadow-soft transition-colors dark:border-[#1e3a5f] dark:bg-[#0f2035] lg:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-white shadow-card">
          <span className="text-lg font-semibold">PC</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-heading">Project Camp</p>
          <p className="text-xs text-on-surface-variant">Workspace dashboard</p>
        </div>
      </div>

      <div className="mb-8 space-y-2">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                active
                  ? 'border-l-4 border-secondary bg-secondary/10 text-secondary'
                  : 'text-on-surface hover:bg-surface-container'
              )}
            >
              <span className="text-base">•</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-4 rounded-3xl bg-surface-container p-5 text-sm text-on-surface dark:bg-[#152538]">
        <p className="font-semibold">Create a new project</p>
        <p className="text-on-surface-variant">Only admins can create new projects and invite teammates.</p>
        <Link href="/projects" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 font-semibold text-white transition hover:bg-[#0047b2]">
          <Plus size={16} /> New Project
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-3xl bg-surface p-4 text-sm dark:bg-[#112443]">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-white">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <User className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-semibold text-text-heading">{user?.name ?? 'Guest user'}</p>
          <p className="text-xs text-on-surface-variant">{user?.role ?? 'Visitor'}</p>
        </div>
      </div>
    </aside>
  );
}
