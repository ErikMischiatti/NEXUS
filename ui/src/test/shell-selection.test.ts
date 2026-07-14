import { describe, expect, it } from 'vitest';
import { resolveShellSelection } from '@/components/layout/shell-selection';
import type { PanelSnapshot, WorkspaceSnapshot } from '@/types/runtime-snapshot';

const workspaceA: WorkspaceSnapshot = {
  id: 'workspace-a',
  name: 'Workspace A',
  description: 'Primary workspace',
  sessionLabel: 'Session A',
  sourceLabel: 'Source A',
};

const workspaceB: WorkspaceSnapshot = {
  id: 'workspace-b',
  name: 'Workspace B',
  description: 'Secondary workspace',
  sessionLabel: 'Session B',
  sourceLabel: 'Source B',
};

const panelA1: PanelSnapshot = {
  id: 'panel-a-1',
  title: 'Panel A1',
  pluginId: 'plugin.a1',
  workspaceId: workspaceA.id,
  region: 'main',
  status: 'ready',
  description: 'First panel in workspace A',
};

const panelA2: PanelSnapshot = {
  id: 'panel-a-2',
  title: 'Panel A2',
  pluginId: 'plugin.a2',
  workspaceId: workspaceA.id,
  region: 'right',
  status: 'mock',
  description: 'Second panel in workspace A',
};

const panelB1: PanelSnapshot = {
  id: 'panel-b-1',
  title: 'Panel B1',
  pluginId: 'plugin.b1',
  workspaceId: workspaceB.id,
  region: 'main',
  status: 'placeholder',
  description: 'First panel in workspace B',
};

const snapshot = {
  workspace: workspaceA,
  workspaces: [workspaceA, workspaceB],
  panels: [panelA1, panelA2, panelB1],
};

describe('resolveShellSelection', () => {
  it('preserves a valid workspace and panel selection', () => {
    const resolved = resolveShellSelection(snapshot, { workspaceId: workspaceA.id, panelId: panelA2.id });

    expect(resolved.workspace).toBe(workspaceA);
    expect(resolved.panel).toBe(panelA2);
    expect(resolved.workspacePanels).toEqual([panelA1, panelA2]);
    expect(resolved.selection).toEqual({ workspaceId: workspaceA.id, panelId: panelA2.id });
  });

  it('falls back to the snapshot workspace when the stored workspace is invalid', () => {
    const resolved = resolveShellSelection(snapshot, { workspaceId: 'missing-workspace', panelId: panelA2.id });

    expect(resolved.workspace).toBe(workspaceA);
    expect(resolved.panel).toBe(panelA2);
    expect(resolved.selection.workspaceId).toBe(workspaceA.id);
  });

  it('falls back to the first panel in the resolved workspace when the stored panel is invalid', () => {
    const resolved = resolveShellSelection(snapshot, { workspaceId: workspaceA.id, panelId: 'missing-panel' });

    expect(resolved.workspace).toBe(workspaceA);
    expect(resolved.panel).toBe(panelA1);
    expect(resolved.selection.panelId).toBe(panelA1.id);
  });

  it('rejects a panel that belongs to another workspace', () => {
    const resolved = resolveShellSelection(snapshot, { workspaceId: workspaceA.id, panelId: panelB1.id });

    expect(resolved.workspace).toBe(workspaceA);
    expect(resolved.panel).toBe(panelA1);
    expect(resolved.selection).toEqual({ workspaceId: workspaceA.id, panelId: panelA1.id });
  });

  it('rebases selection when the active workspace disappears in a successor snapshot', () => {
    const successor = {
      workspace: workspaceB,
      workspaces: [workspaceB],
      panels: [panelB1],
    };
    const resolved = resolveShellSelection(successor, { workspaceId: workspaceA.id, panelId: panelA2.id });

    expect(resolved.workspace).toBe(workspaceB);
    expect(resolved.panel).toBe(panelB1);
    expect(resolved.selection).toEqual({ workspaceId: workspaceB.id, panelId: panelB1.id });
  });

  it('rebases selection when the active panel disappears in a successor snapshot', () => {
    const successor = {
      workspace: workspaceA,
      workspaces: [workspaceA, workspaceB],
      panels: [panelA1, panelB1],
    };
    const resolved = resolveShellSelection(successor, { workspaceId: workspaceA.id, panelId: panelA2.id });

    expect(resolved.workspace).toBe(workspaceA);
    expect(resolved.panel).toBe(panelA1);
    expect(resolved.selection).toEqual({ workspaceId: workspaceA.id, panelId: panelA1.id });
  });

  it('handles a snapshot without workspaces or panels', () => {
    const resolved = resolveShellSelection({}, { workspaceId: 'missing', panelId: 'missing' });

    expect(resolved.workspace).toBeUndefined();
    expect(resolved.panel).toBeUndefined();
    expect(resolved.workspacePanels).toEqual([]);
    expect(resolved.selection).toEqual({ workspaceId: '', panelId: '' });
  });

  it('handles a workspace with no panels', () => {
    const successor = {
      workspace: workspaceB,
      workspaces: [workspaceB],
      panels: [],
    };

    const resolved = resolveShellSelection(successor, { workspaceId: workspaceB.id, panelId: panelB1.id });

    expect(resolved.workspace).toBe(workspaceB);
    expect(resolved.panel).toBeUndefined();
    expect(resolved.workspacePanels).toEqual([]);
    expect(resolved.selection).toEqual({ workspaceId: workspaceB.id, panelId: '' });
  });
});
