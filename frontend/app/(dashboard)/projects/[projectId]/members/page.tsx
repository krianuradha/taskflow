'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';
import { useProjectRole } from '@/hooks/useProjectRole';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'member', label: 'Member' },
  { value: 'project_admin', label: 'Project Admin' },
  { value: 'admin', label: 'Admin' },
];

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { data: members, isLoading } = useMembers(projectId);
  const { hasPermission } = useAuth();
  const projectRole = useProjectRole(projectId);
  const canManage = hasPermission('manageMembers', projectRole);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const queryClient = useQueryClient();

  const addMember = useMutation({
    mutationFn: async () => {
      return api.post(`/api/v1/projects/${projectId}/members`, { email, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-role', projectId] });
      setOpen(false);
      setEmail('');
      setRole('member');
      toast.success('Member invited successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Unable to invite member');
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: UserRole }) => {
      return api.put(`/api/v1/projects/${projectId}/members/${memberId}`, { newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      toast.success('Role updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      return api.delete(`/api/v1/projects/${projectId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-role', projectId] });
      toast.success('Member removed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove member');
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Team members</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-heading">Project collaborators</h1>
          <p className="mt-3 text-sm text-on-surface-variant">Invite team members and manage roles from one place.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]"
          >
            <Plus size={18} /> Add member
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-white shadow-soft dark:border-[#1e3a5f] dark:bg-[#131b2e]">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead className="bg-surface text-xs uppercase tracking-[0.23em] text-on-surface-variant dark:bg-[#152538]">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="p-6" colSpan={4}>Loading members…</td>
              </tr>
            ) : members?.length ? (
              members.map((member) => (
                <tr key={member.id} className="border-t border-border-subtle dark:border-[#1e3a5f]">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary font-semibold">
                        {member.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-text-heading">{member.name ?? 'Unknown'}</p>
                        <p className="text-sm text-on-surface-variant">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {canManage ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateRole.mutate({ memberId: member.id, newRole: e.target.value as UserRole })
                        }
                        disabled={updateRole.isPending}
                        className="rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-sm text-on-surface transition focus:border-secondary focus:ring-1 focus:ring-secondary dark:border-[#1e3a5f] dark:bg-[#152538] disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm capitalize text-on-surface-variant">{member.role.replace('_', ' ')}</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    {canManage && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.name ?? member.email} from project?`)) {
                            removeMember.mutate(member.id);
                          }
                        }}
                        disabled={removeMember.isPending}
                        className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface px-4 py-2 text-sm text-on-surface transition hover:border-red-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1e3a5f] dark:bg-[#152538]"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-10 text-center text-sm text-on-surface-variant" colSpan={4}>
                  No members yet. Invite a teammate to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Invite teammate</p>
                <h2 className="mt-2 text-2xl font-semibold text-text-heading">Add a new member</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-3 text-on-surface hover:bg-surface-container dark:hover:bg-[#152538]">×</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teammate@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Role</label>
                <select
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-border-subtle px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => addMember.mutate()}
                  disabled={addMember.isPending || !email.trim()}
                  className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addMember.isPending ? 'Inviting…' : 'Invite member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
