'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { IUser, UserRole } from '@/types';

const permissionMatrix: Record<string, UserRole[]> = {
  createProject: ['admin'],
  editProject: ['admin'],
  manageMembers: ['admin', 'project_admin'],
  manageTasks: ['admin', 'project_admin', 'member'],
  viewTasks: ['admin', 'project_admin', 'member'],
  updateSubtask: ['admin', 'project_admin', 'member'],
  manageSubtasks: ['admin', 'project_admin'],
  manageNotes: ['admin', 'project_admin', 'member'],
  viewNotes: ['admin', 'project_admin', 'member']
};

export function useAuth() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await api.get<{ data: IUser }>('/api/v1/auth/current-user');
      return response.data.data;
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (query.isError) {
      router.replace('/login');
    }
  }, [query.isError, router]);

  /**
   * Check if the given role (or user's global role) has the given permission.
   * @param action  - The permission key from permissionMatrix
   * @param role    - The project-level role (from useProjectRole). If omitted,
   *                  falls back to user.role (usually undefined for global user).
   *                  When role is undefined and user is authenticated, returns true
   *                  for broad permissions (manageTasks, manageNotes, viewTasks, viewNotes)
   *                  to avoid blocking all users, since role is project-specific.
   */
  const hasPermission = (action: keyof typeof permissionMatrix, role?: UserRole) => {
    const effectiveRole = role ?? (query.data as any)?.role;
    if (!query.data) return false; // not logged in at all
    if (!effectiveRole) {
      // User is authenticated but role is not yet resolved (still loading).
      // Default to allowing broad member-level actions to avoid permanently hidden buttons.
      const broadActions = ['manageTasks', 'viewTasks', 'manageNotes', 'viewNotes', 'updateSubtask'];
      return broadActions.includes(action as string);
    }
    return permissionMatrix[action].includes(effectiveRole);
  };

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    hasPermission
  };
}
