'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';
import api from '@/lib/api';

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { data: members, isLoading } = useMembers(projectId);
  const { hasPermission } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const addMember = useMutation({
    mutationFn: async () => {
      return api.post(`/api/v1/projects/${projectId}/members`, { email, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      setOpen(false);
      setEmail('');
      setRole('member');
      setMessage('Member invited successfully.');
    },
    onError: () => {
      setMessage('Unable to invite member.');
    }
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      return api.delete(`/api/v1/projects/${projectId}/members/${memberId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', projectId] })
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-[#131b2e] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Team members</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-heading">Project collaborators</h1>
          <p className="mt-3 text-sm text-on-surface-variant">Invite team members and manage roles from one place.</p>
        </div>
        {hasPermission('manageMembers') && (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]">
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">{member.name.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-text-heading">{member.name}</p>
                        <p className="text-sm text-on-surface-variant">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{member.role}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{new Date(member.joinedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => removeMember.mutate(member.id)}
                      disabled={!hasPermission('manageMembers')}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface px-4 py-2 text-sm text-on-surface transition hover:border-error hover:text-error disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1e3a5f] dark:bg-[#152538]"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-10 text-center text-sm text-on-surface-variant" colSpan={4}>No members yet. Invite a teammate to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
              <label className="block text-sm font-medium text-on-surface">Email</label>
              <input
                className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <label className="block text-sm font-medium text-on-surface">Role</label>
              <select
                className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="member">Member</option>
                <option value="project_admin">Project Admin</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-border-subtle px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => addMember.mutate()}
                  disabled={addMember.isPending}
                  className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Invite member
                </button>
              </div>
              {message && <p className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-on-surface dark:border-[#1e3a5f]">{message}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
