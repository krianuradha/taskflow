'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, UserCircle2, LogOut, User, X, Camera, Check, Loader2, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { IUser } from '@/types';
import { clearTokens } from '@/lib/auth';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

interface TopBarProps {
  user?: IUser | null;
  toggleSidebar: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function TopBar({ user, toggleSidebar }: TopBarProps) {
  const queryClient = useQueryClient();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Edit Profile Form State
  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch or initialize notifications from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('taskflow_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      const initial: NotificationItem[] = [
        {
          id: '1',
          title: 'Welcome to TaskFlow! 🎉',
          message: 'Explore your projects, manage tasks, and collaborate with your team.',
          time: 'Just now',
          read: false,
        },
        {
          id: '2',
          title: 'Profile Customization 💡',
          message: 'Click on your profile badge to upload an avatar and customize your profile info.',
          time: '1 min ago',
          read: false,
        },
      ];
      setNotifications(initial);
      localStorage.setItem('taskflow_notifications', JSON.stringify(initial));
    }
  }, []);

  const saveNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    localStorage.setItem('taskflow_notifications', JSON.stringify(newNotifs));
  };

  const markAllAsRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveNotifications(notifications.filter((n) => n.id !== id));
  };

  const toggleNotificationRead = (id: string) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="sticky top-0 z-10 border-b border-border-subtle bg-bg-main/95 backdrop-blur-xl transition-colors dark:border-[#1e3a5f] dark:bg-[#0f2035]/95">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        {/* Search Input */}
        <button onClick={toggleSidebar} className="lg:hidden rounded-full p-2 bg-surface-container text-on-surface hover:bg-surface-container/80">
          <Menu size={24} />
        </button>
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-[24rem]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              aria-label="Search projects and tasks"
              placeholder="Search projects, tasks, members"
              className="w-full rounded-full border border-border-subtle bg-white px-12 py-3 text-sm text-on-surface shadow-sm transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538] dark:border-[#1e3a5f]"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative" ref={notifyRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative rounded-full bg-surface p-3 text-on-surface shadow-sm transition hover:bg-surface-container dark:bg-[#152538] dark:hover:bg-[#1b2f4d]"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0f2035]" />
              )}
            </button>

            {/* Notifications Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border-subtle bg-white p-4 shadow-soft transition-all dark:border-[#1e3a5f] dark:bg-[#0f2035] sm:w-[22rem]">
                <div className="mb-3 flex items-center justify-between border-b pb-2 dark:border-[#1e3a5f]">
                  <h3 className="font-semibold text-text-heading">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-secondary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-sm text-on-surface-variant">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => toggleNotificationRead(n.id)}
                        className={`group relative flex cursor-pointer gap-3 rounded-xl p-3 transition-colors ${
                          n.read
                            ? 'bg-transparent hover:bg-surface-container/50 dark:hover:bg-[#152538]/50'
                            : 'bg-secondary/5 hover:bg-secondary/10 dark:bg-[#0058be]/10 dark:hover:bg-[#0058be]/20'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-sm ${!n.read ? 'font-semibold text-text-heading' : 'text-on-surface'}`}>
                              {n.title}
                            </p>
                            <button
                              onClick={(e) => dismissNotification(n.id, e)}
                              className="text-xs text-on-surface-variant hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Dismiss"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
                            {n.message}
                          </p>
                          <span className="mt-2 block text-[10px] text-on-surface-variant/70">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* User Profile Dropdown Toggle */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 rounded-full bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-surface-container/30 dark:bg-[#152538] dark:hover:bg-[#1b2f4d]"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-secondary/10"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white">
                  <UserCircle2 size={18} />
                </div>
              )}
              <div className="hidden min-w-[10rem] flex-col text-left sm:flex">
                <span className="font-semibold text-text-heading truncate max-w-[10rem]">
                  {user?.name ?? 'TaskFlow'}
                </span>
                <span className="text-xs text-on-surface-variant capitalize">
                  {user?.role ?? 'Member'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border-subtle bg-white p-2 shadow-soft transition-all dark:border-[#1e3a5f] dark:bg-[#0f2035]">
                {/* User Info Header */}
                <div className="border-b px-4 py-3 dark:border-[#1e3a5f]">
                  <p className="font-semibold text-text-heading truncate">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">@{ (user as any)?.username || 'user' }</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-on-surface transition hover:bg-surface-container dark:hover:bg-[#152538]"
                  >
                    <User size={16} />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/35"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal open={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
}
