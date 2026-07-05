import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { useRuntimeSnapshot, useRuntimeSnapshotAdapter } from '@/runtime/runtime-snapshot-context';
import { RuntimeSnapshotProvider } from '@/runtime/runtime-snapshot-provider';

const SnapshotProbe = () => {
  const snapshot = useRuntimeSnapshot();
  return (
    <div>
      <span>{snapshot.runtime.name}</span>
      <span>{snapshot.connection.label}</span>
      <span>{snapshot.events.length}</span>
    </div>
  );
};

const AdapterProbe = () => {
  const snapshot = useRuntimeSnapshot();
  const adapter = useRuntimeSnapshotAdapter();
  const lastEventType = snapshot.events[snapshot.events.length - 1]?.type ?? 'none';

  return (
    <div>
      <span aria-label="event-count">{snapshot.events.length}</span>
      <span aria-label="last-event">{lastEventType}</span>
      <button
        type="button"
        onClick={() =>
          adapter.appendEvent({
            severity: 'info',
            source: 'test-harness',
            type: 'test.event.appended',
            description: 'Deterministic event append from test',
            payloadPreview: '{"kind":"test"}',
          })
        }
      >
        Append event
      </button>
      <button type="button" onClick={() => adapter.setRuntimeUptimeLabel('00:20:00')}>
        Bump uptime
      </button>
      <button type="button" onClick={() => adapter.setConnection({ state: 'connected', label: 'Connected to mock bridge', isMock: false })}>
        Connect
      </button>
    </div>
  );
};

describe('RuntimeSnapshotProvider', () => {
  it('renders children and exposes the initial mock snapshot', () => {
    render(
      <RuntimeSnapshotProvider>
        <SnapshotProbe />
      </RuntimeSnapshotProvider>,
    );

    expect(screen.getByText('NEXUS Core Runtime')).toBeInTheDocument();
    expect(screen.getByText('Static shell data only')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('lets the mock adapter append an event deterministically', async () => {
    const user = userEvent.setup();

    render(
      <RuntimeSnapshotProvider>
        <AdapterProbe />
      </RuntimeSnapshotProvider>,
    );

    expect(screen.getByLabelText('event-count')).toHaveTextContent('4');
    expect(screen.getByLabelText('last-event')).toHaveTextContent('plugin.stopped');

    await user.click(screen.getByRole('button', { name: 'Append event' }));

    expect(screen.getByLabelText('event-count')).toHaveTextContent('5');
    expect(screen.getByLabelText('last-event')).toHaveTextContent('test.event.appended');
  });

  it('can update the shell UI through provider state changes', async () => {
    const user = userEvent.setup();

    render(
      <RuntimeSnapshotProvider>
        <AdapterProbe />
        <MemoryRouter initialEntries={['/events']}>
          <App />
        </MemoryRouter>
      </RuntimeSnapshotProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Connect' }));
    await user.click(screen.getByRole('button', { name: 'Bump uptime' }));
    await user.click(screen.getByRole('button', { name: 'Append event' }));

    expect(
      screen.getByText((_, element) => element?.textContent === '00:20:00 · Connected to mock bridge'),
    ).toBeInTheDocument();
    expect(screen.getByText('test.event.appended', { selector: '.event-panel__type' })).toBeInTheDocument();
  });
});
