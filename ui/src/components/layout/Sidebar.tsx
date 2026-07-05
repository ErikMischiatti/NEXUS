import { shellSections, type ShellSectionId } from '@/config/design-system';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { RuntimeSnapshot } from '@/types/runtime-snapshot';

type SidebarProps = {
  activeSection: ShellSectionId;
  snapshot: RuntimeSnapshot;
};

const itemTone = (state: 'ready' | 'placeholder' | 'mock') => {
  if (state === 'ready') return 'success';
  if (state === 'mock') return 'accent';
  return 'warning';
};

const severityTone = (severity: 'info' | 'success' | 'warning' | 'debug') => {
  if (severity === 'success') return 'success';
  if (severity === 'warning') return 'warning';
  if (severity === 'debug') return 'neutral';
  return 'accent';
};

export const Sidebar = ({ activeSection, snapshot }: SidebarProps) => {
  const section = shellSections.find((entry) => entry.id === activeSection) ?? shellSections[0];

  return (
    <aside className="sidebar" aria-label={`${section.label} sidebar`}>
      <Card eyebrow="Section" title={section.label} className="sidebar__card sidebar__card--primary">
        <p className="nexus-copy">{section.description}</p>
      </Card>

      <Card
        eyebrow={activeSection === 'plugins' ? 'Plugin inventory' : activeSection === 'workspaces' ? 'Workspace inventory' : activeSection === 'events' ? 'Event inventory' : 'Connection'}
        title={activeSection === 'plugins' ? 'Workspace plugins' : activeSection === 'workspaces' ? 'Workspace roster' : activeSection === 'events' ? 'Recent events' : 'Runtime connection'}
        className="sidebar__card sidebar__card--dense"
      >
        {activeSection === 'plugins' ? (
          <div className="sidebar__list" role="list" aria-label="Workspace plugins">
            {snapshot.plugins.map((plugin) => (
              <article key={plugin.id} className="sidebar__item" role="listitem">
                <div className="sidebar__item-header">
                  <strong>{plugin.name}</strong>
                  <Badge tone={itemTone(plugin.status)}>{plugin.status}</Badge>
                </div>
                <p className="nexus-copy nexus-copy--muted">{plugin.description}</p>
                {plugin.version ? <p className="nexus-copy nexus-copy--muted">Version {plugin.version}</p> : null}
              </article>
            ))}
          </div>
        ) : null}

        {activeSection === 'workspaces' ? (
          <div className="sidebar__list" role="list" aria-label="Workspace roster">
            {snapshot.workspaces.map((workspace) => (
              <article key={workspace.id} className="sidebar__item" role="listitem">
                <div className="sidebar__item-header">
                  <strong>{workspace.name}</strong>
                  <Badge tone={workspace.id === snapshot.workspace.id ? 'success' : 'neutral'}>
                    {workspace.id === snapshot.workspace.id ? 'active' : 'available'}
                  </Badge>
                </div>
                <p className="nexus-copy nexus-copy--muted">{workspace.description}</p>
                <p className="nexus-copy nexus-copy--muted">
                  {workspace.sessionLabel} · {workspace.sourceLabel}
                </p>
              </article>
            ))}
          </div>
        ) : null}

        {activeSection === 'events' ? (
          <div className="sidebar__list" role="list" aria-label="Recent events">
            {snapshot.events.slice(0, 3).map((event) => (
              <article key={event.id} className="sidebar__item" role="listitem">
                <div className="sidebar__item-header">
                  <strong>{event.type}</strong>
                  <Badge tone={severityTone(event.severity)}>{event.severity}</Badge>
                </div>
                <p className="nexus-copy nexus-copy--muted">{event.description}</p>
                <p className="nexus-copy nexus-copy--muted">{event.source}</p>
              </article>
            ))}
          </div>
        ) : null}

        {activeSection === 'settings' ? (
          <div className="sidebar__list" role="list" aria-label="Runtime connection">
            <article className="sidebar__item" role="listitem">
              <div className="sidebar__item-header">
                <strong>{snapshot.connection.label}</strong>
                <Badge tone={snapshot.connection.isMock ? 'warning' : 'success'}>{snapshot.connection.state}</Badge>
              </div>
              <p className="nexus-copy nexus-copy--muted">{snapshot.runtime.name}</p>
              <p className="nexus-copy nexus-copy--muted">
                {snapshot.runtime.mode} · {snapshot.runtime.state} · {snapshot.runtime.uptimeLabel}
              </p>
            </article>
          </div>
        ) : null}
      </Card>
    </aside>
  );
};
