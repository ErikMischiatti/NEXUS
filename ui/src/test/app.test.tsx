import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { AppProviders } from '@/providers/AppProviders';
import { useRuntimeSnapshotAdapter } from '@/runtime/runtime-snapshot-context';

const renderShell = (initialEntry = '/plugins') =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </AppProviders>,
  );

const SnapshotControls = () => {
  const adapter = useRuntimeSnapshotAdapter();
  return (
    <button
      type="button"
      onClick={() =>
        adapter.appendEvent({
          severity: 'warning',
          source: 'test-harness',
          type: 'test.shell.event',
          description: 'Shell event emitted from test',
          payloadPreview: '{"source":"test"}',
        })
      }
    >
      Emit shell event
    </button>
  );
};

describe('Operator UI shell foundation', () => {
  it('renders from the provider snapshot boundary', () => {
    renderShell();

    expect(screen.getByText('NEXUS Core Runtime')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operator Default' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Workspace' })).toHaveValue('operator-default');
    expect(screen.getByText('Session OP-204 · Mock fleet / mock session')).toBeInTheDocument();
    expect(screen.getByText('mock ready')).toBeInTheDocument();
    expect(screen.getByText('Static shell data only')).toBeInTheDocument();
    expect(screen.getByText('Plugin View Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Operational log')).toBeInTheDocument();
  });

  it('reads plugin and workspace inventory from the provider snapshot', () => {
    const first = renderShell('/workspaces');

    expect(screen.getByText('Workspace roster')).toBeInTheDocument();
    expect(screen.getByText('Inspection Mission', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('Session TEL-042 · Mock telemetry context')).toBeInTheDocument();

    first.unmount();
    renderShell('/plugins');

    expect(screen.getByText('Workspace plugins')).toBeInTheDocument();
    expect(screen.getByText('Telemetry Demo', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('Version 0.1.0')).toBeInTheDocument();
    expect(screen.getByText('Core Runtime Bridge', { selector: 'strong' })).toBeInTheDocument();
  });

  it('reads panel data from the provider snapshot and keeps selection working', async () => {
    const user = userEvent.setup();
    renderShell('/plugins');

    const tablist = screen.getByRole('tablist', { name: 'Workspace panels' });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(5);
    expect(within(screen.getByRole('complementary', { name: 'Inspector dock' })).getByText('example.telemetry.demo')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Logs Placeholder panel/ }));

    expect(screen.getByRole('heading', { name: 'Logs Placeholder' })).toBeInTheDocument();
    expect(within(screen.getByRole('complementary', { name: 'Inspector dock' })).getByText('nexus.core')).toBeInTheDocument();
  });

  it('reads event data from the provider snapshot and updates when the adapter appends an event', async () => {
    const user = userEvent.setup();

    render(
      <AppProviders>
        <SnapshotControls />
        <MemoryRouter initialEntries={['/events']}>
          <App />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('core.runtime.started', { selector: 'strong' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Emit shell event' }));

    expect(screen.getByText('test.shell.event', { selector: '.event-panel__type' })).toBeInTheDocument();
    expect(screen.getByText('Shell event emitted from test')).toBeInTheDocument();
  });
});
