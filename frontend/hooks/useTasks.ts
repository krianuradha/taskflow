'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ITask, ISubtask } from '@/types';

export function useProjectTasks(projectId: string) {
  return useQuery<ITask[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await api.get<{ data: ITask[] }>(`/api/v1/tasks/${projectId}`);
      return response.data.data;
    },
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false
  });
}

export function useTaskDetail(projectId: string, taskId: string) {
  return useQuery<ITask>({
    queryKey: ['task', projectId, taskId],
    queryFn: async () => {
      const response = await api.get<{ data: ITask }>(`/api/v1/tasks/${projectId}/t/${taskId}`);
      return response.data.data;
    },
    enabled: Boolean(projectId && taskId),
    refetchOnWindowFocus: false
  });
}

export function useToggleSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subtask: ISubtask) => {
      const response = await api.put<{ data: ISubtask }>(`/api/v1/tasks/${projectId}/st/${subtask.id}`, {
        completed: !subtask.completed
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; description: string; assignedTo?: string; priority: string; dueDate: string; status: string }) => {
      const response = await api.post<{ data: ITask }>(`/api/v1/tasks/${projectId}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  });
}
