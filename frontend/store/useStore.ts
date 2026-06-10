'use client';

import { create } from 'zustand';

interface StoreState {
  sidebarOpen: boolean;
  currentProjectId: string | null;
  setSidebarOpen: (value: boolean) => void;
  setCurrentProjectId: (projectId: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  sidebarOpen: false,
  currentProjectId: null,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
  setCurrentProjectId: (projectId) => set({ currentProjectId: projectId })
}));
