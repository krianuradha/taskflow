'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { IProject } from '@/types';

export function useProject(projectId: string) {
  return useQuery<IProject>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<{ data: IProject }>(`/api/v1/projects/${projectId}`);
      return response.data.data;
    },
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false
  });
}
