import { create } from 'zustand';
import { defaultWorkspaceId, initialShellSection } from '@/data/mock-shell';
import type { ShellSectionId } from '@/config/design-system';

type ShellStoreState = {
  activeSection: ShellSectionId;
  activeWorkspaceId: string;
  setActiveSection: (section: ShellSectionId) => void;
  setActiveWorkspaceId: (workspaceId: string) => void;
};

export const useShellStore = create<ShellStoreState>((set) => ({
  activeSection: initialShellSection,
  activeWorkspaceId: defaultWorkspaceId,
  setActiveSection: (activeSection) => set({ activeSection }),
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
}));
