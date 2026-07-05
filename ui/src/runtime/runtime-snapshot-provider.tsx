import { useMemo, useState, type PropsWithChildren } from 'react';
import { mockRuntimeSnapshot, createMockRuntimeSnapshot } from '@/data/mock-runtime-snapshot';
import { RuntimeSnapshotContext } from '@/runtime/runtime-snapshot-context';
import {
  appendMockEvent,
  updateConnectionSnapshot,
  updatePanelStatus,
  updatePluginStatus,
  updateRuntimeUptimeLabel,
  type MockRuntimeAdapter,
} from '@/runtime/mock-runtime-adapter';
import type { RuntimeSnapshot } from '@/types/runtime-snapshot';

export type RuntimeSnapshotProviderProps = PropsWithChildren<{
  initialSnapshot?: RuntimeSnapshot;
}>;

export const RuntimeSnapshotProvider = ({ children, initialSnapshot }: RuntimeSnapshotProviderProps) => {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(initialSnapshot ?? createMockRuntimeSnapshot());

  const adapter: MockRuntimeAdapter = useMemo(
    () => ({
      appendEvent: (event) => setSnapshot((current) => appendMockEvent(current, event)),
      setConnection: (connection) => setSnapshot((current) => updateConnectionSnapshot(current, connection)),
      setRuntimeUptimeLabel: (uptimeLabel) => setSnapshot((current) => updateRuntimeUptimeLabel(current, uptimeLabel)),
      setPluginStatus: (pluginId, status) => setSnapshot((current) => updatePluginStatus(current, pluginId, status)),
      setPanelStatus: (panelId, status) => setSnapshot((current) => updatePanelStatus(current, panelId, status)),
    }),
    [],
  );

  return <RuntimeSnapshotContext.Provider value={{ snapshot, adapter }}>{children}</RuntimeSnapshotContext.Provider>;
};

export const createMockRuntimeSnapshotProviderValue = () => ({
  snapshot: mockRuntimeSnapshot,
  adapter: {
    appendEvent: () => undefined,
    setConnection: () => undefined,
    setRuntimeUptimeLabel: () => undefined,
    setPluginStatus: () => undefined,
    setPanelStatus: () => undefined,
  },
});
