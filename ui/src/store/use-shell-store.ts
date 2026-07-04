import { create } from 'zustand';
import { defaultWorkspaceId, defaultWorkspacePanelId, initialShellSection } from '@/data/mock-shell';
import type { ShellSectionId } from '@/config/design-system';

type ShellStoreState = {
  activeSection: ShellSectionId;
  activeWorkspaceId: string;
  activePanelId: string;
  setActiveSection: (section: ShellSectionId) => void;
  setActiveWorkspaceId: (workspaceId: string) => void;
  setActivePanel: (panelId: string) => void;
};

export const useShellStore = create<ShellStoreState>((set) => ({
  activeSection: initialShellSection,
  activeWorkspaceId: defaultWorkspaceId,
  activePanelId: defaultWorkspacePanelId,
  setActiveSection: (activeSection) => set({ activeSection }),
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
  setActivePanel: (activePanelId) => set({ activePanelId }),
}));
