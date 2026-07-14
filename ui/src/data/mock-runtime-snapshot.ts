import { defaultShellSection, type ShellSectionId } from '@/config/design-system';
import type {
  ConnectionSnapshot,
  EventSnapshot,
  PanelSnapshot,
  PluginSnapshot,
  RuntimeSnapshot,
  WorkspaceSnapshot,
} from '@/types/runtime-snapshot';

const baseTimestamp = Date.parse('2026-07-04T12:00:00.000Z');
const timestamp = (offsetMinutes: number): string => new Date(baseTimestamp - offsetMinutes * 60_000).toISOString();

export const createMockRuntimeSnapshot = (): RuntimeSnapshot => {
  const workspaces: WorkspaceSnapshot[] = [
    {
      id: 'operator-default',
      name: 'Operator Default',
      description: 'General-purpose workspace for plugin composition and review.',
      sessionLabel: 'Session OP-204',
      sourceLabel: 'Mock fleet / mock session',
    },
    {
      id: 'inspection-mission',
      name: 'Inspection Mission',
      description: 'Placeholder workspace for mission-oriented shell behavior.',
      sessionLabel: 'Session INSP-118',
      sourceLabel: 'Mock inspection context',
    },
    {
      id: 'telemetry-review',
      name: 'Telemetry Review',
      description: 'Layout for reviewing plugin-hosted telemetry surfaces.',
      sessionLabel: 'Session TEL-042',
      sourceLabel: 'Mock telemetry context',
    },
  ];

  const plugins: PluginSnapshot[] = [
    {
      id: 'example.telemetry.demo',
      name: 'Telemetry Demo',
      status: 'ready',
      description: 'Plugin host placeholder prepared for future telemetry views.',
      version: '0.1.0',
    },
    {
      id: 'future.mission.plugin',
      name: 'Mission Placeholder',
      status: 'placeholder',
      description: 'Reserved for future mission planning content.',
    },
    {
      id: 'nexus.core',
      name: 'Core Runtime Bridge',
      status: 'mock',
      description: 'Static metadata for the shell-level runtime bridge surface.',
      version: '0.0.0-mock',
    },
  ];

  const panels: PanelSnapshot[] = [
    {
      id: 'telemetry-demo',
      title: 'Telemetry Demo',
      pluginId: 'example.telemetry.demo',
      workspaceId: 'operator-default',
      region: 'main',
      status: 'ready',
      description: 'Plugin-host placeholder for a future telemetry view.',
    },
    {
      id: 'runtime-events',
      title: 'Runtime Events',
      pluginId: 'nexus.core',
      workspaceId: 'operator-default',
      region: 'bottom',
      status: 'mock',
      description: 'Docked event feed for core and plugin lifecycle messages.',
    },
    {
      id: 'mission-placeholder',
      title: 'Mission Placeholder',
      pluginId: 'future.mission.plugin',
      workspaceId: 'inspection-mission',
      region: 'right',
      status: 'placeholder',
      description: 'Placeholder for future mission planning content.',
    },
    {
      id: 'map-placeholder',
      title: 'Map Placeholder',
      pluginId: 'future.map.plugin',
      workspaceId: 'telemetry-review',
      region: 'main',
      status: 'placeholder',
      description: 'Reserved for a future map-oriented plugin surface.',
    },
    {
      id: 'logs-placeholder',
      title: 'Logs Placeholder',
      pluginId: 'nexus.core',
      workspaceId: 'telemetry-review',
      region: 'right',
      status: 'mock',
      description: 'Inspector-style region for log and diagnostic summaries.',
    },
  ];

  const events: EventSnapshot[] = [
    {
      id: 'evt-001',
      time: timestamp(6),
      severity: 'success',
      source: 'nexus-core',
      type: 'core.runtime.started',
      description: 'Mock runtime boot event',
      payloadPreview: '{"runtime":"nexus-runtime","mode":"mock"}',
    },
    {
      id: 'evt-002',
      time: timestamp(4),
      severity: 'info',
      source: 'plugin-manager',
      type: 'plugin.loaded',
      description: 'Mock plugin lifecycle milestone',
      payloadPreview: '{"pluginId":"example.telemetry.demo"}',
    },
    {
      id: 'evt-003',
      time: timestamp(2),
      severity: 'info',
      source: 'example.telemetry.demo',
      type: 'telemetry.normalized.updated',
      description: 'Example event surfaced in the stream',
      payloadPreview: '{"temperatureC":21.75,"humidityPercent":42.2}',
    },
    {
      id: 'evt-004',
      time: timestamp(1),
      severity: 'warning',
      source: 'plugin-manager',
      type: 'plugin.stopped',
      description: 'Mock lifecycle stop signal',
      payloadPreview: '{"pluginId":"example.telemetry.demo"}',
    },
  ];

  const runtime = {
    id: 'nexus-runtime-mock',
    name: 'NEXUS Core Runtime',
    mode: 'mock' as const,
    state: 'ready' as const,
    uptimeLabel: '00:19:42',
  };

  const connection: ConnectionSnapshot = {
    state: 'mock',
    label: 'Static shell data only',
    isMock: true,
  };

  return {
    runtime,
    workspace: workspaces[0],
    workspaces,
    plugins,
    panels,
    events,
    connection,
  };
};

export const mockRuntimeSnapshot = createMockRuntimeSnapshot();
export const defaultWorkspaceId = mockRuntimeSnapshot.workspace.id;
export const defaultPanelId = mockRuntimeSnapshot.panels[0]?.id ?? 'telemetry-demo';
export const defaultWorkspacePanelId = defaultPanelId;
export const initialShellSection: ShellSectionId = defaultShellSection;
