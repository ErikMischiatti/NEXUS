import type { PanelSnapshot, RuntimeSnapshot, WorkspaceSnapshot } from '@/types/runtime-snapshot';

export type ShellSelectionState = {
  workspaceId?: string;
  panelId?: string;
};

export type ShellSelectionSource = {
  workspace?: WorkspaceSnapshot;
  workspaces?: WorkspaceSnapshot[];
  panels?: PanelSnapshot[];
};

export type ShellSelection = {
  workspace: WorkspaceSnapshot | undefined;
  workspacePanels: PanelSnapshot[];
  panel: PanelSnapshot | undefined;
  selection: Required<ShellSelectionState>;
};

const resolveWorkspace = (snapshot: ShellSelectionSource, workspaceId?: string) => {
  const workspaces = snapshot.workspaces ?? (snapshot.workspace ? [snapshot.workspace] : []);
  return workspaces.find((workspace) => workspace.id === workspaceId) ?? snapshot.workspace ?? workspaces[0];
};

export const resolveShellSelection = (snapshot: ShellSelectionSource, selection: ShellSelectionState = {}): ShellSelection => {
  const workspace = resolveWorkspace(snapshot, selection.workspaceId);
  const workspacePanels = workspace
    ? (snapshot.panels ?? []).filter((panel) => panel.workspaceId === workspace.id)
    : [];
  const panel = workspacePanels.find((entry) => entry.id === selection.panelId) ?? workspacePanels[0];

  return {
    workspace,
    workspacePanels,
    panel,
    selection: {
      workspaceId: workspace?.id ?? '',
      panelId: panel?.id ?? '',
    },
  };
};

export const isSameShellSelection = (left: ShellSelectionState, right: ShellSelectionState) =>
  left.workspaceId === right.workspaceId && left.panelId === right.panelId;

export type ShellSelectionSnapshot = Pick<RuntimeSnapshot, 'workspaces' | 'panels'> & {
  workspace?: RuntimeSnapshot['workspace'];
};
