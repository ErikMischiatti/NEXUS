import { Card } from '@/components/ui/Card';
import { useShellStore } from '@/store/use-shell-store';
import { getWorkspaceById } from '@/data/mock-shell';

export const Workspace = () => {
  const activeWorkspaceId = useShellStore((state) => state.activeWorkspaceId);
  const workspace = getWorkspaceById(activeWorkspaceId);

  return (
    <main className="workspace" aria-label="Workspace">
      <Card eyebrow="Workspace" title={workspace.name} className="workspace__panel">
        <p className="nexus-copy">{workspace.description}</p>
        <p className="nexus-copy nexus-copy--muted">{workspace.scope}</p>
      </Card>

      <section className="plugin-host" aria-label="Plugin host region">
        <Card eyebrow="Plugin Host" title="Plugin View Placeholder" className="plugin-host__card">
          {/* Future plugins will mount React components into this region. */}
          <p className="nexus-copy">
            This shell is intentionally empty for now. Future plugin panels will mount here without redesigning the
            shell layout.
          </p>
          <div className="plugin-host__slot">Plugin mounting surface</div>
        </Card>
      </section>
    </main>
  );
};
