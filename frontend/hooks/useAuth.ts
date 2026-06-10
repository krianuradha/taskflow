'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { IUser, UserRole } from '@/types';

const permissionMatrix: Record<string, UserRole[]> = {
  createProject: ['admin'],
  editProject: ['admin'],
  manageMembers: ['admin'],
  manageTasks: ['admin', 'project_admin'],
  viewTasks: ['admin', 'project_admin', 'member'],
  updateSubtask: ['admin', 'project_admin', 'member'],
  manageSubtasks: ['admin', 'project_admin'],
  manageNotes: ['admin'],
  viewNotes: ['admin', 'project_admin', 'member']
};

export function useAuth() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await api.get<{ user: IUser }>('/api/v1/auth/current-user');
      return response.data.user;
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (query.isError) {
      router.replace('/login');
    }
  }, [query.isError, router]);

  const hasPermission = (action: keyof typeof permissionMatrix) => {
    if (!query.data) return false;
    return permissionMatrix[action].includes(query.data.role);
  };

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    hasPermission
  };
}
