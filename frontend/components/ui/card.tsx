'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('rounded-[1.25rem] border border-border-subtle bg-white p-6 shadow-soft transition-colors dark:bg-[#131b2e]', className)}>{children}</div>;
}
