import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { AppProviders } from '@/providers/AppProviders';

const renderShell = (initialEntry = '/plugins') =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </AppProviders>,
  );

describe('Operator UI shell foundation', () => {
  it('renders from the runtime snapshot boundary', () => {
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

  it('reads plugin and workspace inventory from the snapshot', () => {
    renderShell('/workspaces');

    expect(screen.getByText('Workspace roster')).toBeInTheDocument();
    expect(screen.getByText('Inspection Mission', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('Session TEL-042 · Mock telemetry context')).toBeInTheDocument();

    renderShell('/plugins');

    expect(screen.getByText('Workspace plugins')).toBeInTheDocument();
    expect(screen.getByText('Telemetry Demo', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('Version 0.1.0')).toBeInTheDocument();
    expect(screen.getByText('Core Runtime Bridge', { selector: 'strong' })).toBeInTheDocument();
  });

  it('reads panel data from the snapshot and keeps selection working', async () => {
    const user = userEvent.setup();
    renderShell('/plugins');

    const tablist = screen.getByRole('tablist', { name: 'Workspace panels' });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(5);
    expect(within(screen.getByRole('complementary', { name: 'Inspector dock' })).getByText('example.telemetry.demo')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Logs Placeholder panel/ }));

    expect(screen.getByRole('heading', { name: 'Logs Placeholder' })).toBeInTheDocument();
    expect(within(screen.getByRole('complementary', { name: 'Inspector dock' })).getByText('nexus.core')).toBeInTheDocument();
  });

  it('reads event data from the snapshot', () => {
    renderShell('/events');

    expect(screen.getByRole('region', { name: 'Event stream panel' })).toBeInTheDocument();
    expect(screen.getByText('core.runtime.started', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('plugin.loaded', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('telemetry.normalized.updated', { selector: 'strong' })).toBeInTheDocument();
  });
});
