import { ActivityBar } from '@/components/layout/ActivityBar';
import { BottomEventPanel } from '@/components/layout/BottomEventPanel';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Workspace } from '@/components/layout/Workspace';
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
  const setActiveSection = useShellStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection(activeSection);
  }, [activeSection, setActiveSection]);

  if (!isShellSection(params.section)) {
    return <Navigate replace to="/plugins" />;
  }

  return (
    <div className="shell-frame">
      <TopBar snapshot={snapshot} />
      <ActivityBar activeSection={activeSection} />
      <Sidebar activeSection={activeSection} snapshot={snapshot} />
      <Workspace snapshot={snapshot} />
      <BottomEventPanel events={snapshot.events} />
    </div>
  );
};
