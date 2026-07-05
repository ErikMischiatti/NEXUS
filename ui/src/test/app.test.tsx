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
  it('renders the simplified shell structure', () => {
    renderShell();

    expect(screen.getByText('NEXUS Operator Shell')).toBeInTheDocument();
    expect(screen.getByText('Plugin host workspace')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByText('mock online')).toBeInTheDocument();
    expect(screen.getByText('Plugin View Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Operational log')).toBeInTheDocument();
  });

  it('keeps panel selection and inspector details working', async () => {
    const user = userEvent.setup();
    renderShell('/plugins');

    const tablist = screen.getByRole('tablist', { name: 'Workspace panels' });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(5);
    expect(within(screen.getByRole('complementary', { name: 'Inspector dock' })).getByText('example.telemetry.demo')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Logs Placeholder panel/ }));

    expect(screen.getByRole('heading', { name: 'Logs Placeholder' })).toBeInTheDocument();
    expect(within(screen.getByRole('complementary', { name: 'Inspector dock' })).getByText('nexus.core')).toBeInTheDocument();
  });

  it('keeps the plugin host surface and event log visible', () => {
    renderShell('/plugins');

    expect(screen.getByText('Plugin mounting surface')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Event stream panel' })).toBeInTheDocument();
  });
});
