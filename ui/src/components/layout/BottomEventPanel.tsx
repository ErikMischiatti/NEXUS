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

export const BottomEventPanel = ({ events }: BottomEventPanelProps) => (
  <section className="event-panel" aria-label="Event stream panel">
    <Card eyebrow="Event dock" title="Mock Event Bus">
      <p className="event-panel__lede">Static event feed for runtime and plugin lifecycle signals.</p>
      <div className="event-panel__list" role="list" aria-label="Mock event stream">
        {events.map((event) => (
          <article key={event.id} className="event-panel__event" role="listitem">
            <div className="event-panel__event-head">
              <div className="event-panel__event-title-block">
                <Badge tone={severityTone(event.severity)}>{event.severity}</Badge>
                <strong className="event-panel__type">{event.type}</strong>
              </div>
              <span className="event-panel__source">{event.source}</span>
            </div>
            <div className="event-panel__meta-row">
              <span className="event-panel__timestamp">{event.timestamp}</span>
              <span className="event-panel__channel">event bus</span>
            </div>
            <pre className="event-panel__payload">{event.payloadPreview}</pre>
          </article>
        ))}
      </div>
    </Card>
  </section>
);
