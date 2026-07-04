import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getWorkspaceById, getWorkspacePanelById, getWorkspacePanels } from '@/data/mock-shell';
import { useShellStore } from '@/store/use-shell-store';
import type { ShellSnapshot } from '@/data/mock-shell';

type WorkspaceProps = {
  snapshot: ShellSnapshot;
};

const regionLabel = (region: 'main' | 'right' | 'bottom') => {
  if (region === 'main') return 'Main region';
  if (region === 'right') return 'Inspector region';
  return 'Bottom region';
};

export const Workspace = ({ snapshot }: WorkspaceProps) => {
  const activeWorkspaceId = useShellStore((state) => state.activeWorkspaceId);
  const activePanelId = useShellStore((state) => state.activePanelId);
  const setActivePanel = useShellStore((state) => state.setActivePanel);
  const workspace = getWorkspaceById(activeWorkspaceId);
  const runtimeLabel = snapshot.runtime.connection;
  const panels = getWorkspacePanels();
  const activePanel = getWorkspacePanelById(activePanelId) ?? panels[0];

  return (
    <main className="workspace" aria-label="Workspace">
      <Card eyebrow="Workspace" title={workspace?.name ?? 'Workspace'} className="workspace__panel">
        <p className="nexus-copy">{workspace?.description ?? 'Mock workspace composition.'}</p>
        <p className="nexus-copy nexus-copy--muted">{workspace?.scope ?? 'Static shell data only'}</p>
        <p className="nexus-copy nexus-copy--muted">{runtimeLabel}</p>
      </Card>

      <section className="workspace-dock" aria-label="Dockable workspace">
        <header className="workspace-dock__header">
          <div>
            <span className="nexus-card__eyebrow">Dockable panels</span>
            <h2 className="workspace-dock__title">Plugin Host Prototype</h2>
          </div>
          <div className="workspace-dock__legend" aria-label="Panel regions">
            <Badge tone="accent">Static</Badge>
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
                aria-label={`${panel.title} panel, ${panel.region} region`}
                onClick={() => setActivePanel(panel.id)}
              >
                <span className="workspace-dock__tab-title">{panel.title}</span>
                <Badge tone={panel.status === 'ready' ? 'success' : panel.status === 'mock' ? 'accent' : 'warning'}>
                  {panel.status}
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="workspace-dock__grid">
          <section className="workspace-dock__main" aria-label="Main plugin host region">
            <Card eyebrow={activePanel?.region ? regionLabel(activePanel.region) : 'Main region'} title="Plugin View Placeholder" className="workspace-dock__panel">
              {/* Future plugins will mount React components into this region. */}
              <p className="nexus-copy">
                This is the dockable plugin-host surface. Future plugin views will render here without changing the shell
                layout.
              </p>
              <div className="workspace-dock__slot">Plugin mounting surface</div>
            </Card>
          </section>

          <aside className="workspace-dock__inspector" aria-label="Inspector region">
            <Card eyebrow="Active panel" title={activePanel?.title ?? 'Plugin Host Placeholder'} className="workspace-dock__panel">
              <div className="workspace-dock__details">
                <p className="nexus-copy">{activePanel?.description}</p>
                <dl className="workspace-dock__meta">
                  <div>
                    <dt>Plugin</dt>
                    <dd>{activePanel?.pluginId}</dd>
                  </div>
                  <div>
                    <dt>Region</dt>
                    <dd>{activePanel ? regionLabel(activePanel.region) : 'Main region'}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <Badge tone={activePanel?.status === 'ready' ? 'success' : activePanel?.status === 'mock' ? 'accent' : 'warning'}>
                        {activePanel?.status ?? 'placeholder'}
                      </Badge>
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
                      <span>{panel.title}</span>
                      <Badge tone={panel.status === 'ready' ? 'success' : panel.status === 'mock' ? 'accent' : 'warning'}>
                        {panel.region}
                      </Badge>
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
