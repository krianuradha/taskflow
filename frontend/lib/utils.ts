import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function progressValue(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function taskStatusLabel(status: string) {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    case 'done':
      return 'Done';
    default:
      return 'Todo';
  }
}

export function taskPriorityLabel(priority: string) {
  return priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low';
}
