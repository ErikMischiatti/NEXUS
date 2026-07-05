import { Badge } from '@/components/ui/Badge';
import { useRuntimeSnapshot } from '@/runtime/runtime-snapshot-context';

const telemetryPluginId = 'example.telemetry.demo';

const severityTone = (severity: 'info' | 'success' | 'warning' | 'debug') => {
  if (severity === 'success') return 'success';
  if (severity === 'warning') return 'warning';
  if (severity === 'debug') return 'neutral';
  return 'accent';
};

const runtimeTone = (state: 'ready' | 'idle' | 'degraded' | 'error') => {
  if (state === 'ready') return 'success';
  if (state === 'degraded' || state === 'error') return 'danger';
  return 'neutral';
};

const connectionTone = (state: 'mock' | 'connected' | 'disconnected') => {
  if (state === 'connected') return 'success';
  if (state === 'disconnected') return 'danger';
  return 'warning';
};

const formatTime = (time: string) => time.slice(11, 19);

export const TelemetryDemoView = () => {
  const snapshot = useRuntimeSnapshot();
  const plugin = snapshot.plugins.find((entry) => entry.id === telemetryPluginId);
  const telemetryEvents = snapshot.events.filter((event) => event.source === telemetryPluginId);
  const recentEvents = snapshot.events.slice(-3).reverse();
  const latestEvent = snapshot.events[snapshot.events.length - 1];

  return (
    <section className="telemetry-demo-view" aria-label="Telemetry demo plugin view">
      <header className="telemetry-demo-view__header">
        <div>
          <span className="nexus-card__eyebrow">Plugin view</span>
          <h3 className="telemetry-demo-view__title">Telemetry Demo</h3>
          <p className="nexus-copy telemetry-demo-view__lede">
            Mock operational panel mounted through the UI registry.
          </p>
        </div>
        <div className="telemetry-demo-view__badges">
          <Badge tone={runtimeTone(snapshot.runtime.state)}>{snapshot.runtime.state}</Badge>
          <Badge tone={connectionTone(snapshot.connection.state)}>{snapshot.connection.label}</Badge>
          <Badge tone={plugin?.status === 'ready' ? 'success' : plugin?.status === 'mock' ? 'accent' : 'warning'}>
            {plugin?.status ?? 'unknown'}
          </Badge>
        </div>
      </header>

      <div className="telemetry-demo-view__grid">
        <section className="telemetry-demo-view__panel" aria-label="Runtime status summary">
          <h4 className="telemetry-demo-view__panel-title">Runtime status</h4>
          <p className="nexus-copy">{snapshot.runtime.name}</p>
          <p className="nexus-copy nexus-copy--muted">
            {snapshot.runtime.mode} · {snapshot.runtime.state} · {snapshot.runtime.uptimeLabel}
          </p>
        </section>

        <section className="telemetry-demo-view__panel" aria-label="Telemetry counters">
          <h4 className="telemetry-demo-view__panel-title">Mock counters</h4>
          <dl className="telemetry-demo-view__metrics">
            <div>
              <dt>Total events</dt>
              <dd>{snapshot.events.length}</dd>
            </div>
            <div>
              <dt>Telemetry events</dt>
              <dd>{telemetryEvents.length}</dd>
            </div>
            <div>
              <dt>Panels</dt>
              <dd>{snapshot.panels.length}</dd>
            </div>
          </dl>
        </section>

        <section className="telemetry-demo-view__panel telemetry-demo-view__panel--wide" aria-label="Latest event summary">
          <h4 className="telemetry-demo-view__panel-title">Latest event</h4>
          {latestEvent ? (
            <div className="telemetry-demo-view__event">
              <div className="telemetry-demo-view__event-head">
                <Badge tone={severityTone(latestEvent.severity)}>{latestEvent.severity}</Badge>
                <span className="telemetry-demo-view__event-type">{latestEvent.type}</span>
                <time className="telemetry-demo-view__timestamp" dateTime={latestEvent.time}>
                  {formatTime(latestEvent.time)}
                </time>
              </div>
              <p className="nexus-copy">{latestEvent.description}</p>
              <p className="nexus-copy nexus-copy--muted">Source {latestEvent.source}</p>
            </div>
          ) : (
            <p className="nexus-copy nexus-copy--muted">No events available.</p>
          )}
        </section>

        <section className="telemetry-demo-view__panel telemetry-demo-view__panel--wide" aria-label="Recent event timeline">
          <h4 className="telemetry-demo-view__panel-title">Timeline</h4>
          <ul className="telemetry-demo-view__timeline" role="list">
            {recentEvents.map((event) => (
              <li key={event.id} className="telemetry-demo-view__timeline-item">
                <span className="telemetry-demo-view__timeline-time">{formatTime(event.time)}</span>
                <span className="telemetry-demo-view__timeline-type">{event.type}</span>
                <span className="telemetry-demo-view__timeline-source">{event.source}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
};
