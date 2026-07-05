import { Badge } from '@/components/ui/Badge';
import type { ShellSnapshot } from '@/data/mock-shell';
import { useShellStore } from '@/store/use-shell-store';

type TopBarProps = {
  snapshot: ShellSnapshot;
};

export const TopBar = ({ snapshot }: TopBarProps) => {
  const activeWorkspaceId = useShellStore((state) => state.activeWorkspaceId);
  const setActiveWorkspaceId = useShellStore((state) => state.setActiveWorkspaceId);
  const activeWorkspace = snapshot.workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? snapshot.workspaces[0];

  return (
    <header className="top-bar" aria-label="Shell top bar">
      <div className="top-bar__branding">
        <div className="top-bar__mark" aria-hidden="true">
          NX
        </div>
        <div className="top-bar__titles">
          <span className="top-bar__eyebrow">NEXUS Operator Shell</span>
          <h1 className="top-bar__title">Plugin host workspace</h1>
        </div>
      </div>

      <div className="top-bar__center">
        <label className="top-bar__selector-label" htmlFor="workspace-selector">
          Workspace
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
        <div className="top-bar__runtime" aria-label="Runtime status">
          <Badge tone="success">{snapshot.runtime.status.replace(/-/g, ' ')}</Badge>
          <span className="top-bar__runtime-note">{snapshot.runtime.connection}</span>
        </div>
        <div className="top-bar__toolbar" aria-label="Global actions">
          <button className="top-bar__icon-action" type="button" disabled aria-label="Future action placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button className="top-bar__icon-action" type="button" disabled aria-label="User settings placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M6 19c1.4-3 4-4.5 6-4.5s4.6 1.5 6 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
