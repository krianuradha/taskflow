'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { UserRole } from '@/types';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

/**
 * Returns the current logged-in user's role within a specific project.
 * Fetches /api/v1/projects/:projectId/members and matches against
 * /api/v1/auth/current-user._id to find the role.
 */
export function useProjectRole(projectId: string): UserRole | undefined {
  const { data: role } = useQuery<UserRole | undefined>({
    queryKey: ['project-role', projectId],
    queryFn: async () => {
      // Fetch current user and members in parallel
      const [userRes, membersRes] = await Promise.all([
        api.get<{ data: { _id: string; id: string } }>('/api/v1/auth/current-user'),
        api.get<{ data: ProjectMember[] }>(`/api/v1/projects/${projectId}/members`),
      ]);

      const currentUser = userRes.data.data;
      const currentUserId = currentUser._id || currentUser.id;
      const members = membersRes.data.data;

      const self = members.find(
        (m) => m.id === currentUserId || m.id === currentUserId?.toString()
      );
      return self?.role;
    },
    enabled: Boolean(projectId),
    staleTime: 30_000, // 30 seconds — role won't change often
    refetchOnWindowFocus: false,
  });

  return role;
}
