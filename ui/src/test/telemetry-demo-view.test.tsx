import { render, screen, within } from '@testing-library/react';
import { RuntimeSnapshotProvider } from '@/runtime/runtime-snapshot-provider';
import { TelemetryDemoView } from '@/plugins/telemetry-demo/TelemetryDemoView';

describe('TelemetryDemoView', () => {
  it('renders a believable mock operational panel from the runtime snapshot', () => {
    render(
      <RuntimeSnapshotProvider>
        <TelemetryDemoView />
      </RuntimeSnapshotProvider>,
    );

    expect(screen.getByRole('region', { name: 'Telemetry demo plugin view' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Telemetry Demo', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Runtime status')).toBeInTheDocument();
    expect(screen.getByText('Mock counters')).toBeInTheDocument();
    expect(screen.getByText('Telemetry Demo', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('NEXUS Core Runtime')).toBeInTheDocument();
    expect(screen.getByText('plugin.stopped', { selector: '.telemetry-demo-view__event-type' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Recent event timeline' })).getByText('plugin.stopped')).toBeInTheDocument();
  });
});
