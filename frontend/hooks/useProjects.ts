'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { IProject } from '@/types';

export function useProjects() {
  return useQuery<IProject[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<{ data: IProject[] }>('/api/v1/projects/');
      return response.data.data;
    },
    refetchOnWindowFocus: false
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description: string }) => {
      const response = await api.post<{ data: IProject }>('/api/v1/projects/', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}
