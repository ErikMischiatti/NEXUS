import { ActivityBar } from '@/components/layout/ActivityBar';
import { BottomEventPanel } from '@/components/layout/BottomEventPanel';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Workspace } from '@/components/layout/Workspace';
import { isSameShellSelection, resolveShellSelection } from '@/components/layout/shell-selection';
import type { RuntimeSnapshot } from '@/types/runtime-snapshot';
import { useShellStore } from '@/store/use-shell-store';
import { useEffect } from 'react';
import type { ShellSectionId } from '@/config/design-system';
import { Navigate, useParams } from 'react-router-dom';

type ShellFrameProps = {
  snapshot: RuntimeSnapshot;
};

const isShellSection = (value: string | undefined): value is ShellSectionId =>
  value === 'plugins' || value === 'workspaces' || value === 'events' || value === 'settings';

export const ShellFrame = ({ snapshot }: ShellFrameProps) => {
  const params = useParams();
  const activeSection = isShellSection(params.section) ? params.section : 'plugins';
  const activeWorkspaceId = useShellStore((state) => state.activeWorkspaceId);
  const activePanelId = useShellStore((state) => state.activePanelId);
  const setActiveSection = useShellStore((state) => state.setActiveSection);
  const setSelection = useShellStore((state) => state.setSelection);
  const resolvedSelection = resolveShellSelection(snapshot, {
    workspaceId: activeWorkspaceId,
    panelId: activePanelId,
  });
  const canonicalWorkspaceId = resolvedSelection.selection.workspaceId;
  const canonicalPanelId = resolvedSelection.selection.panelId;

  useEffect(() => {
    setActiveSection(activeSection);
  }, [activeSection, setActiveSection]);

  useEffect(() => {
    if (!isSameShellSelection({ workspaceId: activeWorkspaceId, panelId: activePanelId }, resolvedSelection.selection)) {
      setSelection(resolvedSelection.selection);
    }
  }, [activePanelId, activeWorkspaceId, canonicalPanelId, canonicalWorkspaceId, setSelection]);

  if (!isShellSection(params.section)) {
    return <Navigate replace to="/plugins" />;
  }

  return (
    <div className="shell-frame">
      <TopBar snapshot={snapshot} selection={resolvedSelection} onSelectionChange={setSelection} />
      <ActivityBar activeSection={activeSection} />
      <Sidebar activeSection={activeSection} snapshot={snapshot} selectedWorkspaceId={resolvedSelection.workspace?.id} />
      <Workspace snapshot={snapshot} selection={resolvedSelection} onSelectionChange={setSelection} />
      <BottomEventPanel events={snapshot.events} />
    </div>
  );
};
