'use client';

import { Bell, Search, UserCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { IUser } from '@/types';

interface TopBarProps {
  user?: IUser | null;
}

export default function TopBar({ user }: TopBarProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border-subtle bg-bg-main/95 backdrop-blur-xl transition-colors dark:border-[#1e3a5f] dark:bg-[#0f2035]/95">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-[24rem]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              aria-label="Search projects and tasks"
              placeholder="Search projects, tasks, members"
              className="w-full rounded-full border border-border-subtle bg-white px-12 py-3 text-sm text-on-surface shadow-sm transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538] dark:border-[#1e3a5f]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative rounded-full bg-surface p-3 text-on-surface shadow-sm transition hover:bg-surface-container dark:bg-[#152538] dark:hover:bg-[#1b2f4d]">
            <Bell size={20} />
            <span className="absolute -right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0f2035]" />
          </button>
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 text-sm shadow-sm transition dark:bg-[#152538]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white">
              <UserCircle2 size={18} />
            </div>
            <div className="hidden min-w-[10rem] flex-col sm:flex">
              <span className="font-semibold text-text-heading">{user?.name ?? 'TaskFlow'}</span>
              <span className="text-xs text-on-surface-variant">{user?.role ?? 'Member'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
