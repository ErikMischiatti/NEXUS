import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ShellEvent } from '@/data/mock-shell';

type BottomEventPanelProps = {
  events: ShellEvent[];
};

const severityTone = (severity: ShellEvent['severity']) => {
  if (severity === 'success') return 'success';
  if (severity === 'warning') return 'warning';
  if (severity === 'debug') return 'neutral';
  return 'accent';
};

const formatEventTime = (timestamp: string) => timestamp.slice(11, 19);

export const BottomEventPanel = ({ events }: BottomEventPanelProps) => (
  <section className="event-panel" aria-label="Event stream panel">
    <Card eyebrow="Event dock" title="Operational log">
      <p className="event-panel__lede">Mock event bus feed for runtime and plugin lifecycle signals.</p>
      <div className="event-panel__list" role="list" aria-label="Mock event stream">
        {events.map((event) => (
          <article key={event.id} className="event-panel__event" role="listitem">
            <div className="event-panel__event-head">
              <div className="event-panel__event-title-block">
                <time className="event-panel__timestamp" dateTime={event.timestamp}>
                  {formatEventTime(event.timestamp)}
                </time>
                <Badge tone={severityTone(event.severity)}>{event.severity}</Badge>
                <span className="event-panel__type">{event.type}</span>
              </div>
              <span className="event-panel__source">{event.source}</span>
            </div>
            <p className="event-panel__description">{event.description}</p>
            <div className="event-panel__meta-row">
              <span className="event-panel__channel">event bus</span>
              <span className="event-panel__separator">·</span>
              <span className="event-panel__payload-label">payload preview</span>
            </div>
            <pre className="event-panel__payload">{event.payloadPreview}</pre>
          </article>
        ))}
      </div>
    </Card>
  </section>
);
