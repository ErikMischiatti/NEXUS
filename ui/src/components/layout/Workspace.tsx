import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getWorkspacePanelById, getWorkspacePanels } from '@/data/mock-shell';
import { useShellStore } from '@/store/use-shell-store';

const regionLabel = (region: 'main' | 'right' | 'bottom') => {
  if (region === 'main') return 'Main dock';
  if (region === 'right') return 'Inspector dock';
  return 'Event dock';
};

const statusTone = (status: 'ready' | 'placeholder' | 'mock') => {
  if (status === 'ready') return 'success';
  if (status === 'mock') return 'accent';
  return 'warning';
};

export const Workspace = () => {
  const activePanelId = useShellStore((state) => state.activePanelId);
  const setActivePanel = useShellStore((state) => state.setActivePanel);
  const panels = getWorkspacePanels();
  const activePanel = getWorkspacePanelById(activePanelId) ?? panels[0];

  return (
    <main className="workspace" aria-label="Workspace">
      <section className="workspace-dock" aria-label="Dockable workspace">
        <header className="workspace-dock__header">
          <div>
            <span className="nexus-card__eyebrow">Dock surface</span>
            <h2 className="workspace-dock__title">Plugin host prototype</h2>
            <p className="workspace-dock__lede">Mock plugin panels are organized as editor-like tabs.</p>
          </div>
          <div className="workspace-dock__legend" aria-label="Panel regions">
            <Badge tone="accent">{panels.length} panels</Badge>
            <Badge tone="neutral">Static layout</Badge>
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
                <Badge tone={statusTone(panel.status)}>{panel.status}</Badge>
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
              <p className="nexus-copy workspace-dock__description">
                This region is reserved for future plugin views.
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
              className="workspace-dock__panel workspace-dock__panel--inspector"
            >
              <div className="workspace-dock__details">
                <p className="nexus-copy workspace-dock__description">{activePanel?.description}</p>
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
                      <Badge tone={statusTone(activePanel?.status ?? 'placeholder')}>
                        {activePanel?.status ?? 'placeholder'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
};
