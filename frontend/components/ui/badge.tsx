'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'accent';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const classes = {
    default: 'bg-surface-container text-text-body',
    success: 'bg-status-done/10 text-status-done',
    warning: 'bg-status-in-progress/10 text-status-in-progress',
    accent: 'bg-secondary text-white'
  };

  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', classes[variant])}>{children}</span>;
}
