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
  it('renders the dockable workspace shell with mock runtime state', () => {
    renderShell();

    expect(screen.getByText('NEXUS Operator Shell')).toBeInTheDocument();
    expect(screen.getByText('Plugin-host workspace')).toBeInTheDocument();
    expect(screen.getByText('Plugin View Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Mock Event Bus')).toBeInTheDocument();
    expect(screen.getByText('mock-online')).toBeInTheDocument();
    expect(screen.getByText('Future actions placeholder')).toBeDisabled();
  });

  it('renders panel tabs and updates the active panel when one is selected', async () => {
    const user = userEvent.setup();
    renderShell('/plugins');

    const tablist = screen.getByRole('tablist', { name: 'Workspace panels' });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: 'Telemetry Demo' })).toBeInTheDocument();
    expect(within(screen.getByRole('complementary', { name: 'Inspector dock' })).getByText('example.telemetry.demo')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Logs Placeholder panel/ }));

    expect(screen.getByRole('heading', { name: 'Logs Placeholder' })).toBeInTheDocument();
    expect(screen.getByText('nexus.core')).toBeInTheDocument();
  });

  it('keeps the plugin-host placeholder and event stream visible', () => {
    renderShell('/plugins');

    expect(
      screen.getByText(/future plugin views will render here without changing the shell layout/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Event stream panel' })).toBeInTheDocument();
  });
});
