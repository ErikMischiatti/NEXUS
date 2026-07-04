import { Badge } from '@/components/ui/Badge';
import type { ShellSnapshot } from '@/data/mock-shell';

type StatusAreaProps = {
  runtime: ShellSnapshot['runtime'];
  workspaceName: string;
  activePanelTitle: string;
  pluginCount: number;
};

export const StatusArea = ({ runtime, workspaceName, activePanelTitle, pluginCount }: StatusAreaProps) => (
  <section className="status-area" aria-label="Shell status">
    <div className="status-area__row">
      <span className="status-area__heading">Runtime state</span>
      <Badge tone="success">{runtime.status}</Badge>
    </div>
    <dl className="status-area__grid">
      <div>
        <dt>Active workspace</dt>
        <dd>{workspaceName}</dd>
      </div>
      <div>
        <dt>Registered plugins</dt>
        <dd>{pluginCount}</dd>
      </div>
      <div>
        <dt>Active panel</dt>
        <dd>{activePanelTitle}</dd>
      </div>
      <div>
        <dt>Runtime connection</dt>
        <dd>{runtime.connection}</dd>
      </div>
    </dl>
  </section>
);
