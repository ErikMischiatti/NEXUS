import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '@/App';
import { createMockRuntimeSnapshot } from '@/data/mock-runtime-snapshot';
import { bootstrapPluginViews } from '@/plugins';
import { AppProviders } from '@/providers/AppProviders';
import { RuntimeSnapshotProvider } from '@/runtime/runtime-snapshot-provider';
import { useShellStore } from '@/store/use-shell-store';
import type { RuntimeSnapshot } from '@/types/runtime-snapshot';

const initialShellStoreState = useShellStore.getState();

const resetShellStore = () => {
  useShellStore.setState(initialShellStoreState, true);
};

beforeEach(resetShellStore);
afterEach(resetShellStore);

const renderShell = (initialEntry = '/plugins') => {
  bootstrapPluginViews();

  let renderResult: ReturnType<typeof render> | undefined;

  act(() => {
    renderResult = render(
      <AppProviders>
        <MemoryRouter initialEntries={[initialEntry]}>
          <App />
        </MemoryRouter>
      </AppProviders>,
    );
  });

  return renderResult!;
};

const renderShellWithSnapshot = (snapshot: RuntimeSnapshot, initialEntry = '/plugins') => {
  bootstrapPluginViews();

  let renderResult: ReturnType<typeof render> | undefined;

  act(() => {
    renderResult = render(
      <RuntimeSnapshotProvider initialSnapshot={snapshot}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <App />
        </MemoryRouter>
      </RuntimeSnapshotProvider>,
    );
  });

  return renderResult!;
};

const createZeroPanelSnapshot = () => {
  const snapshot = createMockRuntimeSnapshot();
  const workspace = snapshot.workspaces[1];

  if (!workspace) {
    throw new Error('Mock runtime snapshot is missing the secondary workspace.');
  }

  return {
    ...snapshot,
    workspace,
    workspaces: [workspace],
    panels: [],
  };
};

const createSinglePanelSnapshot = () => {
  const snapshot = createMockRuntimeSnapshot();
  const panel = snapshot.panels[0];

  if (!panel) {
    throw new Error('Mock runtime snapshot is missing the primary panel.');
  }

  return {
    ...snapshot,
    workspace: snapshot.workspace,
    workspaces: [snapshot.workspace],
    panels: [panel],
  };
};

describe('Operator UI shell foundation', () => {
  it('renders a complete ARIA tab pattern for the workspace panels', () => {
    renderShell();

    const tablist = screen.getByRole('tablist', { name: 'Workspace panels' });
    const tabs = within(tablist).getAllByRole('tab');
    const tabpanels = screen.getAllByRole('tabpanel', { hidden: true });

    expect(tabs).toHaveLength(2);
    expect(tabpanels).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Operator Default' })).toBeInTheDocument();
    expect(screen.getByText('NEXUS Core Runtime', { selector: '.top-bar__eyebrow' })).toBeInTheDocument();
    expect(screen.getByText('mock ready')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Telemetry demo plugin view' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel', { name: 'Telemetry Demo' })).toBeVisible();

    const selectedTab = screen.getByRole('tab', { selected: true });

    expect(selectedTab).toHaveTextContent('Telemetry Demo');
    expect(selectedTab).toHaveAttribute('tabindex', '0');
    expect(within(tablist).getByRole('tab', { name: 'Runtime Events' })).toHaveAttribute('tabindex', '-1');

    for (const tab of tabs) {
      const controlledPanel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      const labelledTab = tab.getAttribute('id');

      expect(tab).toHaveAttribute('aria-controls');
      expect(controlledPanel).toBeTruthy();
      expect(controlledPanel).toHaveAttribute('role', 'tabpanel');
      expect(controlledPanel).toHaveAttribute('aria-labelledby', labelledTab);
    }

    expect(
      screen
        .getAllByRole('tabpanel', { hidden: true })
        .find((panel) => panel.id === 'workspace-panel-runtime-events'),
    ).toHaveAttribute('hidden');
  });

  it('supports click selection and roving keyboard navigation with wrapping', async () => {
    const user = userEvent.setup();
    renderShell();

    const telemetryDemoTab = screen.getByRole('tab', { name: 'Telemetry Demo' });
    const runtimeEventsTab = screen.getByRole('tab', { name: 'Runtime Events' });

    await user.click(runtimeEventsTab);

    expect(runtimeEventsTab).toHaveFocus();
    expect(runtimeEventsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Runtime Events' })).toBeVisible();
    expect(telemetryDemoTab).toHaveAttribute('tabindex', '-1');
    expect(runtimeEventsTab).toHaveAttribute('tabindex', '0');

    await user.keyboard('{ArrowLeft}');

    expect(telemetryDemoTab).toHaveFocus();
    expect(telemetryDemoTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Telemetry Demo' })).toBeVisible();

    await user.keyboard('{ArrowRight}');

    expect(runtimeEventsTab).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Runtime Events' })).toBeVisible();

    await user.keyboard('{Home}');

    expect(telemetryDemoTab).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Telemetry Demo' })).toBeVisible();

    await user.keyboard('{End}');

    expect(runtimeEventsTab).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Runtime Events' })).toBeVisible();
    expect(screen.getByRole('tab', { selected: true })).toBe(runtimeEventsTab);
  });

  it('renders the zero-panel workspace empty state without a selected tab', async () => {
    const snapshot = createZeroPanelSnapshot();

    renderShellWithSnapshot(snapshot, '/workspaces');

    await screen.findByRole('heading', { name: 'Inspection Mission' });
    expect(screen.getByRole('heading', { name: 'No panels available' })).toBeInTheDocument();
    expect(screen.getByText('This workspace has no panels in the current snapshot.')).toBeInTheDocument();

    const tablist = screen.getByRole('tablist', { name: 'Workspace panels' });
    const workspaceRoster = screen.getByRole('list', { name: 'Workspace roster' });

    expect(within(tablist).queryAllByRole('tab')).toHaveLength(0);
    expect(screen.queryByRole('tab', { selected: true })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Telemetry demo plugin view' })).toBeNull();
    expect(within(workspaceRoster).getByText('Inspection Mission')).toBeInTheDocument();
    expect(within(workspaceRoster).getByText('active')).toBeInTheDocument();
    await waitFor(() => {
      expect(useShellStore.getState().activeWorkspaceId).toBe(snapshot.workspace.id);
      expect(useShellStore.getState().activePanelId).toBe('');
    });
  });

  it('keeps a single panel tab stable across keyboard navigation', async () => {
    const user = userEvent.setup();
    const snapshot = createSinglePanelSnapshot();

    renderShellWithSnapshot(snapshot, '/workspaces');

    const tablist = screen.getByRole('tablist', { name: 'Workspace panels' });
    const tabs = within(tablist).getAllByRole('tab');
    const [tab] = tabs;
    const workspaceRoster = screen.getByRole('list', { name: 'Workspace roster' });

    expect(tabs).toHaveLength(1);
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('tabindex', '0');
    expect(tab).toHaveAttribute('aria-controls', 'workspace-panel-telemetry-demo');
    expect(document.getElementById('workspace-panel-telemetry-demo')).toHaveAttribute('aria-labelledby', tab.id);
    expect(screen.getByRole('tabpanel', { name: 'Telemetry Demo' })).toBeVisible();
    expect(within(workspaceRoster).getByText('Operator Default')).toBeInTheDocument();
    expect(within(workspaceRoster).getByText('active')).toBeInTheDocument();

    await user.click(tab);
    expect(tab).toHaveFocus();

    for (const key of ['{ArrowLeft}', '{ArrowRight}', '{Home}', '{End}']) {
      await user.keyboard(key);
      expect(tab).toHaveFocus();
      expect(tab).toHaveAttribute('aria-selected', 'true');
      expect(tab).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('tabpanel', { name: 'Telemetry Demo' })).toBeVisible();
    }

    expect(screen.getByRole('tab', { selected: true })).toBe(tab);
    await waitFor(() => {
      expect(useShellStore.getState().activeWorkspaceId).toBe(snapshot.workspace.id);
      expect(useShellStore.getState().activePanelId).toBe(snapshot.panels[0]?.id);
    });
  });

  it('keeps missing plugin views on the placeholder path', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Workspace' }), 'telemetry-review');
    await user.click(screen.getByRole('tab', { name: 'Logs Placeholder' }));

    await waitFor(() => {
      expect(useShellStore.getState().activeWorkspaceId).toBe('telemetry-review');
      expect(useShellStore.getState().activePanelId).toBe('logs-placeholder');
    });

    expect(screen.getByRole('heading', { name: 'Telemetry Review' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel', { name: 'Logs Placeholder' })).toBeVisible();
    expect(screen.getByText('Plugin View Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Reserved for future React plugin components.')).toBeInTheDocument();
  });
});
