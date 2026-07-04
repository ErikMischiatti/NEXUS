import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ShellEvent } from '@/data/mock-shell';

type BottomEventPanelProps = {
  events: ShellEvent[];
};

export const BottomEventPanel = ({ events }: BottomEventPanelProps) => (
  <section className="event-panel" aria-label="Event stream panel">
    <Card eyebrow="Bottom Panel" title="Mock Event Stream">
      <div className="event-panel__list" role="list" aria-label="Mock event stream">
        {events.map((event) => (
          <article key={event.id} className="event-panel__event" role="listitem">
            <div className="event-panel__event-head">
              <Badge tone="neutral">{event.type}</Badge>
              <span className="event-panel__source">{event.source}</span>
            </div>
            <div className="event-panel__meta">{event.timestamp}</div>
            <pre className="event-panel__payload">{event.payloadPreview}</pre>
          </article>
        ))}
      </div>
    </Card>
  </section>
);
