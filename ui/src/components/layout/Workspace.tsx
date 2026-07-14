import { useRef, type KeyboardEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { pluginViewRegistry } from '@/plugins';
import { resolveShellSelection, type ShellSelection } from '@/components/layout/shell-selection';
import type { RuntimeSnapshot } from '@/types/runtime-snapshot';

type WorkspaceProps = {
  snapshot: RuntimeSnapshot;
  selection: ShellSelection;
  onSelectionChange: (selection: ShellSelection['selection']) => void;
};

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

const tabId = (panelId: string) => `workspace-tab-${panelId}`;
const panelId = (panelId: string) => `workspace-panel-${panelId}`;

export const Workspace = ({ snapshot, selection, onSelectionChange }: WorkspaceProps) => {
  const tabRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const activeWorkspace = selection.workspace;
  const panels = selection.workspacePanels;
  const activePanel = selection.panel;
  const activePluginView = activePanel ? pluginViewRegistry.get(activePanel.pluginId) : undefined;
  const PluginViewComponent = activePluginView?.component;

  const updatePanelSelection = (nextPanelId: string) =>
    onSelectionChange(
      resolveShellSelection(snapshot, {
        workspaceId: activeWorkspace?.id,
        panelId: nextPanelId,
      }).selection,
    );

  const focusPanel = (nextPanelId: string) => {
    tabRefs.current.get(nextPanelId)?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (panels.length === 0) {
      return;
    }

    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % panels.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + panels.length) % panels.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = panels.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextPanel = panels[nextIndex];
    updatePanelSelection(nextPanel.id);
    focusPanel(nextPanel.id);
  };

  return (
    <main className="workspace" aria-label="Workspace">
      <section className="workspace-dock" aria-label="Dockable workspace">
        <header className="workspace-dock__header">
          <div>
            <span className="nexus-card__eyebrow">Dock surface</span>
            <h2 className="workspace-dock__title">Plugin host prototype</h2>
            <p className="workspace-dock__lede">
              {activeWorkspace?.name ?? 'No workspace selected'} is organized as editor-like tabs for mock plugin panels.
            </p>
          </div>
          <div className="workspace-dock__legend" aria-label="Panel regions">
            <Badge tone="accent">{panels.length} panels</Badge>
            <Badge tone="neutral">{snapshot.connection.label}</Badge>
          </div>
        </header>

        <div className="workspace-dock__tabs" role="tablist" aria-label="Workspace panels" aria-orientation="horizontal">
          {panels.map((panel, index) => {
            const isActive = panel.id === activePanel?.id;
            const descriptionId = `${tabId(panel.id)}-description`;

            return (
              <button
                key={panel.id}
                ref={(node) => {
                  if (node) {
                    tabRefs.current.set(panel.id, node);
                  } else {
                    tabRefs.current.delete(panel.id);
                  }
                }}
                id={tabId(panel.id)}
                type="button"
                className={`workspace-dock__tab${isActive ? ' is-active' : ''}`}
                role="tab"
                aria-controls={panelId(panel.id)}
                aria-selected={isActive}
                aria-label={panel.title}
                aria-describedby={descriptionId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => updatePanelSelection(panel.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span className="workspace-dock__tab-copy">
                  <span className="workspace-dock__tab-title">{panel.title}</span>
                  <span id={descriptionId} className="workspace-dock__tab-subtitle">
                    {panel.description}
                  </span>
                </span>
                <Badge tone={statusTone(panel.status)}>{panel.status}</Badge>
              </button>
            );
          })}
        </div>

        {panels.length > 0 ? (
          <div className="workspace-dock__tabpanel-stack">
            {panels.map((panel) => {
              const isActive = panel.id === activePanel?.id;

              return (
                <section
                  key={panel.id}
                  id={panelId(panel.id)}
                  className="workspace-dock__tabpanel"
                  role="tabpanel"
                  aria-labelledby={tabId(panel.id)}
                  hidden={!isActive}
                >
                  {isActive ? (
                    <div className="workspace-dock__grid">
                      <section className="workspace-dock__main" aria-label="Main dock">
                        <Card
                          eyebrow="Main dock"
                          title={activePluginView?.title ?? 'Plugin View Placeholder'}
                          className="workspace-dock__panel workspace-dock__panel--main"
                        >
                          {PluginViewComponent ? (
                            <div className="workspace-dock__plugin-host">
                              <PluginViewComponent />
                            </div>
                          ) : (
                            <>
                              <p className="nexus-copy workspace-dock__description">
                                This region is reserved for future plugin views in {activeWorkspace?.sourceLabel ?? 'this workspace'}.
                              </p>
                              <div className="workspace-dock__slot">
                                <div>
                                  <strong>Plugin mounting surface</strong>
                                  <p>Reserved for future React plugin components.</p>
                                </div>
                              </div>
                            </>
                          )}
                        </Card>
                      </section>

                      <aside className="workspace-dock__inspector" aria-label="Inspector dock">
                        <Card
                          eyebrow="Inspector dock"
                          title={activePanel?.title ?? 'Plugin Host Placeholder'}
                          className="workspace-dock__panel workspace-dock__panel--inspector"
                        >
                          <div className="workspace-dock__details">
                            <p className="nexus-copy workspace-dock__description">{activePanel?.description ?? 'No panel selected.'}</p>
                            <dl className="workspace-dock__meta">
                              <div>
                                <dt>Plugin</dt>
                                <dd>{activePanel?.pluginId ?? 'None'}</dd>
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
                  ) : null}
                </section>
              );
            })}
          </div>
        ) : (
          <section className="workspace-dock__tabpanel" aria-label="Workspace panels unavailable">
            <Card eyebrow="Main dock" title="No panels available" className="workspace-dock__panel workspace-dock__panel--main">
              <p className="nexus-copy workspace-dock__description">This workspace has no panels in the current snapshot.</p>
            </Card>
          </section>
        )}
      </section>
    </main>
  );
};
