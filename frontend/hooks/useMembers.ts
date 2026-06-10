'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { IMember } from '@/types';

export function useMembers(projectId: string) {
  return useQuery<IMember[]>({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const response = await api.get<{ data: IMember[] }>(`/api/v1/projects/${projectId}/members`);
      return response.data.data;
    },
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false
  });
}
