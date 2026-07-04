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
  it('renders the plugin host shell with mock runtime state', () => {
    renderShell();

    expect(screen.getByText('NEXUS')).toBeInTheDocument();
    expect(screen.getByText('Operator Shell')).toBeInTheDocument();
    expect(screen.getByText('Plugin View Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Mock Event Stream')).toBeInTheDocument();
    expect(screen.getByText('mock-online')).toBeInTheDocument();
    expect(screen.getByText('Future action area')).toBeDisabled();
  });

  it('switches the sidebar when the activity bar changes section', async () => {
    const user = userEvent.setup();
    renderShell('/plugins');

    await user.click(screen.getByRole('link', { name: /Workspaces/ }));

    expect(screen.getByRole('heading', { name: 'Workspaces' })).toBeInTheDocument();
    expect(within(screen.getByRole('complementary', { name: 'Workspaces sidebar' })).getByText('Operator Default')).toBeInTheDocument();
  });

  it('keeps the workspace placeholder ready for future plugin views', () => {
    renderShell('/plugins');

    expect(
      screen.getByText(/future plugin panels will mount here without redesigning the shell layout/i),
    ).toBeInTheDocument();
  });
});
