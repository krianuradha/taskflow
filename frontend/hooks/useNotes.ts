'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { INote } from '@/types';

export function useNotes(projectId: string) {
  return useQuery<INote[]>({
    queryKey: ['notes', projectId],
    queryFn: async () => {
      const response = await api.get<{ data: INote[] }>(`/api/v1/notes/${projectId}`);
      return response.data.data;
    },
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false
  });
}
