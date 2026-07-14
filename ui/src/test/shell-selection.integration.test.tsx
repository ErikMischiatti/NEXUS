import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/App';
import { bootstrapPluginViews } from '@/plugins';
import { RuntimeSnapshotProvider } from '@/runtime/runtime-snapshot-provider';
import { useShellStore } from '@/store/use-shell-store';
import { createMockRuntimeSnapshot } from '@/data/mock-runtime-snapshot';
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
  description: 'Replacement workspace',
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

const panelB1: PanelSnapshot = {
  id: 'panel-b-1',
  title: 'Panel B1',
  pluginId: 'plugin.b1',
  workspaceId: workspaceB.id,
  region: 'main',
  status: 'placeholder',
  description: 'First panel in workspace B',
};

const createSnapshot = (workspace: WorkspaceSnapshot, workspaces: WorkspaceSnapshot[], panels: PanelSnapshot[]) => ({
  ...createMockRuntimeSnapshot(),
  workspace,
  workspaces,
  panels,
});

const initialShellStoreState = useShellStore.getState();

const resetShellStore = () => {
  useShellStore.setState(initialShellStoreState, true);
};

beforeEach(resetShellStore);
afterEach(resetShellStore);

describe('shell selection synchronization', () => {
  it('reconciles the store and shell UI after an invalidating snapshot change', async () => {
    bootstrapPluginViews();

    const initialSnapshot = createSnapshot(workspaceA, [workspaceA, workspaceB], [panelA1, panelB1]);
    const invalidatedSnapshot = createSnapshot(workspaceB, [workspaceB], [panelB1]);
    const originalSetSelection = useShellStore.getState().setSelection;
    const setSelectionSpy = vi.fn(originalSetSelection);

    useShellStore.setState({
      activeWorkspaceId: workspaceA.id,
      activePanelId: panelA1.id,
      setSelection: setSelectionSpy,
    });

    let renderResult: ReturnType<typeof render> | undefined;

    await act(async () => {
      renderResult = render(
        <RuntimeSnapshotProvider key="initial" initialSnapshot={initialSnapshot}>
          <MemoryRouter initialEntries={['/workspaces']}>
            <App />
          </MemoryRouter>
        </RuntimeSnapshotProvider>,
      );
    });

    const { rerender } = renderResult!;

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Workspace A' })).toBeInTheDocument();
      expect(screen.getByRole('tabpanel', { name: 'Panel A1' })).toBeInTheDocument();
      expect(useShellStore.getState().activeWorkspaceId).toBe(workspaceA.id);
      expect(useShellStore.getState().activePanelId).toBe(panelA1.id);
    });
    expect(setSelectionSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <RuntimeSnapshotProvider key="invalidated" initialSnapshot={invalidatedSnapshot}>
          <MemoryRouter initialEntries={['/workspaces']}>
            <App />
          </MemoryRouter>
        </RuntimeSnapshotProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Workspace B' })).toBeInTheDocument();
      expect(screen.getByRole('tabpanel', { name: 'Panel B1' })).toBeInTheDocument();
      expect(useShellStore.getState().activeWorkspaceId).toBe(workspaceB.id);
      expect(useShellStore.getState().activePanelId).toBe(panelB1.id);
      expect(setSelectionSpy).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      rerender(
        <RuntimeSnapshotProvider key="converged" initialSnapshot={invalidatedSnapshot}>
          <MemoryRouter initialEntries={['/workspaces']}>
            <App />
          </MemoryRouter>
        </RuntimeSnapshotProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Workspace B' })).toBeInTheDocument();
      expect(screen.getByRole('tabpanel', { name: 'Panel B1' })).toBeInTheDocument();
      expect(useShellStore.getState().activeWorkspaceId).toBe(workspaceB.id);
      expect(useShellStore.getState().activePanelId).toBe(panelB1.id);
      expect(setSelectionSpy).toHaveBeenCalledTimes(1);
    });
  });
});
