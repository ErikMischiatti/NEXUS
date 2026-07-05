import type { ConnectionSnapshot, EventSnapshot, PanelStatus, RuntimeSnapshot } from '@/types/runtime-snapshot';

const nextEventId = (events: EventSnapshot[]) => {
  const next = events.length + 1;
  return `evt-${String(next).padStart(3, '0')}`;
};

const replaceEvent = (snapshot: RuntimeSnapshot, event: EventSnapshot): RuntimeSnapshot => ({
  ...snapshot,
  events: [...snapshot.events, event],
});

export const appendMockEvent = (
  snapshot: RuntimeSnapshot,
  event: Pick<EventSnapshot, 'severity' | 'source' | 'type' | 'description'> & Partial<Pick<EventSnapshot, 'payloadPreview' | 'time'>>,
): RuntimeSnapshot => {
  const lastTime = snapshot.events.length > 0 ? snapshot.events[snapshot.events.length - 1].time : '2026-07-04T12:00:00.000Z';
  const time = event.time ?? lastTime;
  return replaceEvent(snapshot, {
    id: nextEventId(snapshot.events),
    time,
    severity: event.severity,
    source: event.source,
    type: event.type,
    description: event.description,
    payloadPreview: event.payloadPreview,
  });
};

export const updateConnectionSnapshot = (snapshot: RuntimeSnapshot, connection: Partial<ConnectionSnapshot>): RuntimeSnapshot => ({
  ...snapshot,
  connection: {
    ...snapshot.connection,
    ...connection,
  },
});

export const updateRuntimeUptimeLabel = (snapshot: RuntimeSnapshot, uptimeLabel: string): RuntimeSnapshot => ({
  ...snapshot,
  runtime: {
    ...snapshot.runtime,
    uptimeLabel,
  },
});

export const updatePluginStatus = (snapshot: RuntimeSnapshot, pluginId: string, status: RuntimeSnapshot['plugins'][number]['status']): RuntimeSnapshot => ({
  ...snapshot,
  plugins: snapshot.plugins.map((plugin) => (plugin.id === pluginId ? { ...plugin, status } : plugin)),
});

export const updatePanelStatus = (snapshot: RuntimeSnapshot, panelId: string, status: PanelStatus): RuntimeSnapshot => ({
  ...snapshot,
  panels: snapshot.panels.map((panel) => (panel.id === panelId ? { ...panel, status } : panel)),
});

export type MockRuntimeAdapter = {
  appendEvent: (event: Pick<EventSnapshot, 'severity' | 'source' | 'type' | 'description'> & Partial<Pick<EventSnapshot, 'payloadPreview' | 'time'>>) => void;
  setConnection: (connection: Partial<ConnectionSnapshot>) => void;
  setRuntimeUptimeLabel: (uptimeLabel: string) => void;
  setPluginStatus: (pluginId: string, status: RuntimeSnapshot['plugins'][number]['status']) => void;
  setPanelStatus: (panelId: string, status: PanelStatus) => void;
};
