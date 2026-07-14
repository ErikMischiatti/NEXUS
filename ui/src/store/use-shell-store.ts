import { create } from 'zustand';
import { defaultWorkspaceId, defaultWorkspacePanelId, initialShellSection } from '@/data/mock-runtime-snapshot';
import type { ShellSectionId } from '@/config/design-system';
import type { ShellSelectionState } from '@/components/layout/shell-selection';

type ShellStoreState = {
  activeSection: ShellSectionId;
  activeWorkspaceId?: string;
  activePanelId?: string;
  setActiveSection: (section: ShellSectionId) => void;
  setSelection: (selection: ShellSelectionState) => void;
};

export const useShellStore = create<ShellStoreState>((set) => ({
  activeSection: initialShellSection,
  activeWorkspaceId: defaultWorkspaceId,
  activePanelId: defaultWorkspacePanelId,
  setActiveSection: (activeSection) => set({ activeSection }),
  setSelection: (selection) => set({ activeWorkspaceId: selection.workspaceId, activePanelId: selection.panelId }),
}));
