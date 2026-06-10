'use client';

import { useParams } from 'next/navigation';
import { useTaskDetail, useToggleSubtask } from '@/hooks/useTasks';
import TaskDetailView from '@/components/tasks/TaskDetailView';

export default function TaskDetailsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const taskId = params?.taskId as string;
  const { data: task, isLoading } = useTaskDetail(projectId, taskId);
  const toggleSubtask = useToggleSubtask(projectId, taskId);

  if (isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">Loading task…</div>;
  }

  if (!task) {
    return <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft dark:bg-[#131b2e]">Task not found.</div>;
  }

  return <TaskDetailView task={task} onToggleSubtask={(subtask) => toggleSubtask.mutate(subtask)} />;
}
