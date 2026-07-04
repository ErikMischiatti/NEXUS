import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getWorkspaceById, getWorkspacePanelById, getWorkspacePanels } from '@/data/mock-shell';
import { useShellStore } from '@/store/use-shell-store';
import type { ShellSnapshot } from '@/data/mock-shell';

type WorkspaceProps = {
  snapshot: ShellSnapshot;
};

const regionLabel = (region: 'main' | 'right' | 'bottom') => {
  if (region === 'main') return 'Main dock';
  if (region === 'right') return 'Inspector dock';
  return 'Event dock';
};

const severityTone = (status: 'ready' | 'placeholder' | 'mock') => {
  if (status === 'ready') return 'success';
  if (status === 'mock') return 'accent';
  return 'warning';
};

export const Workspace = ({ snapshot }: WorkspaceProps) => {
  const activeWorkspaceId = useShellStore((state) => state.activeWorkspaceId);
  const activePanelId = useShellStore((state) => state.activePanelId);
  const setActivePanel = useShellStore((state) => state.setActivePanel);
  const workspace = getWorkspaceById(activeWorkspaceId);
  const panels = getWorkspacePanels();
  const activePanel = getWorkspacePanelById(activePanelId) ?? panels[0];

  return (
    <main className="workspace" aria-label="Workspace">
      <Card eyebrow="Workspace" title={workspace?.name ?? 'Workspace'} className="workspace__panel">
        <div className="workspace__summary">
          <p className="nexus-copy">{workspace?.description ?? 'Mock workspace composition.'}</p>
          <p className="nexus-copy nexus-copy--muted">{workspace?.scope ?? 'Static shell data only'}</p>
          <p className="nexus-copy nexus-copy--muted">{snapshot.runtime.connection}</p>
        </div>
      </Card>

      <section className="workspace-dock" aria-label="Dockable workspace">
        <header className="workspace-dock__header">
          <div>
            <span className="nexus-card__eyebrow">Dockable workspace</span>
            <h2 className="workspace-dock__title">Plugin host prototype</h2>
          </div>
          <div className="workspace-dock__legend" aria-label="Panel regions">
            <Badge tone="accent">Static panels</Badge>
            <Badge tone="neutral">Mock layout</Badge>
          </div>
        </header>

        <div className="workspace-dock__tabs" role="tablist" aria-label="Workspace panels">
          {panels.map((panel) => {
            const isActive = panel.id === activePanel?.id;
            return (
              <button
                key={panel.id}
                type="button"
                className={`workspace-dock__tab${isActive ? ' is-active' : ''}`}
                role="tab"
                aria-selected={isActive}
                aria-label={`${panel.title} panel in the ${regionLabel(panel.region)}`}
                onClick={() => setActivePanel(panel.id)}
              >
                <span className="workspace-dock__tab-copy">
                  <span className="workspace-dock__tab-title">{panel.title}</span>
                  <span className="workspace-dock__tab-subtitle">{panel.description}</span>
                </span>
                <Badge tone={severityTone(panel.status)}>{panel.status}</Badge>
              </button>
            );
          })}
        </div>

        <div className="workspace-dock__grid">
          <section className="workspace-dock__main" aria-label="Main dock">
            <Card
              eyebrow="Main dock"
              title="Plugin View Placeholder"
              className="workspace-dock__panel workspace-dock__panel--main"
            >
              {/* Future plugins will mount React components into this region. */}
              <p className="nexus-copy">
                This dock is the primary plugin-host surface. Future plugin views will render here without changing the
                shell layout.
              </p>
              <div className="workspace-dock__slot">
                <div>
                  <strong>Plugin mounting surface</strong>
                  <p>Reserved for future React plugin components.</p>
                </div>
              </div>
            </Card>
          </section>

          <aside className="workspace-dock__inspector" aria-label="Inspector dock">
            <Card
              eyebrow="Inspector dock"
              title={activePanel?.title ?? 'Plugin Host Placeholder'}
              className="workspace-dock__panel"
            >
              <div className="workspace-dock__details">
                <p className="nexus-copy">{activePanel?.description}</p>
                <dl className="workspace-dock__meta">
                  <div>
                    <dt>Plugin</dt>
                    <dd>{activePanel?.pluginId}</dd>
                  </div>
                  <div>
                    <dt>Region</dt>
                    <dd>{activePanel ? regionLabel(activePanel.region) : 'Main dock'}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <Badge tone={severityTone(activePanel?.status ?? 'placeholder')}>{activePanel?.status ?? 'placeholder'}</Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>

            <Card eyebrow="Panel inventory" title="Dock regions" className="workspace-dock__panel">
              <ul className="workspace-dock__inventory" aria-label="Available panels">
                {panels.map((panel) => (
                  <li key={panel.id}>
                    <button
                      type="button"
                      className={`workspace-dock__inventory-item${panel.id === activePanel?.id ? ' is-active' : ''}`}
                      onClick={() => setActivePanel(panel.id)}
                    >
                      <span className="workspace-dock__inventory-title">{panel.title}</span>
                      <span className="workspace-dock__inventory-meta">{regionLabel(panel.region)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
};
