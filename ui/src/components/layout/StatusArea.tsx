import { Badge } from '@/components/ui/Badge';
import type { ShellSnapshot } from '@/data/mock-shell';

type StatusAreaProps = {
  runtime: ShellSnapshot['runtime'];
  workspaceName: string;
};

export const StatusArea = ({ runtime, workspaceName }: StatusAreaProps) => (
  <section className="status-area" aria-label="Runtime status">
    <div className="status-area__row">
      <Badge tone="success">{runtime.status}</Badge>
      <span className="status-area__label">{runtime.name}</span>
    </div>
    <div className="status-area__grid">
      <div>
        <span className="status-area__caption">Workspace</span>
        <strong>{workspaceName}</strong>
      </div>
      <div>
        <span className="status-area__caption">Plugins</span>
        <strong>{runtime.pluginCount}</strong>
      </div>
    </div>
  </section>
);
