'use client';

import React, { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface transition-colors">
      <div className="lg:flex lg:min-h-screen">
        <Sidebar user={user} loading={isLoading} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:pl-[280px]">
          <TopBar user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className={cn('mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8')}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
