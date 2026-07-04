import { useShellStore } from '@/store/use-shell-store';
import type { ShellSnapshot } from '@/data/mock-shell';
import { Badge } from '@/components/ui/Badge';
import { StatusArea } from '@/components/layout/StatusArea';

type TopBarProps = {
  snapshot: ShellSnapshot;
};

export const TopBar = ({ snapshot }: TopBarProps) => {
  const activeWorkspaceId = useShellStore((state) => state.activeWorkspaceId);
  const activePanelId = useShellStore((state) => state.activePanelId);
  const setActiveWorkspaceId = useShellStore((state) => state.setActiveWorkspaceId);
  const activeWorkspace = snapshot.workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? snapshot.workspaces[0];
  const activePanel = snapshot.panels.find((panel) => panel.id === activePanelId) ?? snapshot.panels[0];

  return (
    <header className="top-bar" aria-label="Shell top bar">
      <div className="top-bar__branding">
        <div>
          <span className="top-bar__eyebrow">NEXUS Operator Shell</span>
          <h1 className="top-bar__title">Plugin-host workspace</h1>
        </div>
        <Badge tone="accent">Browser-first</Badge>
      </div>

      <div className="top-bar__center">
        <label className="top-bar__selector-label" htmlFor="workspace-selector">
          Workspace selector
        </label>
        <select
          id="workspace-selector"
          className="top-bar__selector"
          value={activeWorkspace?.id}
          onChange={(event) => setActiveWorkspaceId(event.target.value)}
        >
          {snapshot.workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>

      <div className="top-bar__actions">
        <StatusArea
          runtime={snapshot.runtime}
          workspaceName={activeWorkspace?.name ?? 'Workspace'}
          activePanelTitle={activePanel?.title ?? 'Plugin View Placeholder'}
          pluginCount={snapshot.runtime.pluginCount}
        />
        <button className="top-bar__future-action" type="button" disabled>
          Future actions placeholder
        </button>
      </div>
    </header>
  );
};
