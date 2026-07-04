import { defaultShellSection, type ShellSectionId } from '@/config/design-system';

export type ShellWorkspace = {
  id: string;
  name: string;
  description: string;
  scope: string;
};

export type ShellEvent = {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payloadPreview: string;
};

export type ShellSidebarItem = {
  title: string;
  detail: string;
  state: 'ready' | 'placeholder' | 'mock';
};

export type ShellSnapshot = {
  runtime: {
    name: string;
    status: 'mock-online' | 'mock-idle';
    version: string;
    pluginCount: number;
    connection: string;
  };
  workspaces: ShellWorkspace[];
  sidebarItems: Record<ShellSectionId, ShellSidebarItem[]>;
  events: ShellEvent[];
};

const timestamp = (offsetMinutes: number): string =>
  new Date(Date.now() - offsetMinutes * 60_000).toISOString();

export const mockShellSnapshot: ShellSnapshot = {
  runtime: {
    name: 'NEXUS Core Runtime',
    status: 'mock-online',
    version: '0.1.0',
    pluginCount: 3,
    connection: 'Static shell data only',
  },
  workspaces: [
    {
      id: 'operator-default',
      name: 'Operator Default',
      description: 'General-purpose workspace for plugin composition and review.',
      scope: 'Mock fleet / mock session',
    },
    {
      id: 'inspection-mission',
      name: 'Inspection Mission',
      description: 'Placeholder workspace for future mission-oriented shell behavior.',
      scope: 'Mock mission context',
    },
    {
      id: 'telemetry-review',
      name: 'Telemetry Review',
      description: 'Layout for reviewing plugin-hosted telemetry surfaces.',
      scope: 'Plugin-hosted panels',
    },
  ],
  sidebarItems: {
    plugins: [
      { title: 'Telemetry Demo', detail: 'Plugin host placeholder is ready', state: 'ready' },
      { title: 'Future plugin mount', detail: 'React panels will render here later', state: 'placeholder' },
      { title: 'Registry snapshot', detail: '3 registered plugins in the mock shell', state: 'mock' },
    ],
    workspaces: [
      { title: 'Operator Default', detail: 'Primary shell composition', state: 'ready' },
      { title: 'Inspection Mission', detail: 'Placeholder mission workspace', state: 'placeholder' },
      { title: 'Telemetry Review', detail: 'Panel layout for event review', state: 'mock' },
    ],
    events: [
      { title: 'core.runtime.started', detail: 'Mock runtime boot event', state: 'ready' },
      { title: 'plugin.loaded', detail: 'Mock plugin lifecycle milestone', state: 'mock' },
      { title: 'telemetry.normalized.updated', detail: 'Example event surfaced in the stream', state: 'placeholder' },
    ],
    settings: [
      { title: 'Theme', detail: 'Dark shell tokens enabled', state: 'ready' },
      { title: 'Layout density', detail: 'Comfortable spacing for operator readability', state: 'mock' },
      { title: 'Future actions', detail: 'Reserved for shell commands and shortcuts', state: 'placeholder' },
    ],
  },
  events: [
    {
      id: 'evt-001',
      type: 'core.runtime.started',
      source: 'nexus-core',
      timestamp: timestamp(6),
      payloadPreview: '{"runtime":"nexus-runtime","mode":"mock"}',
    },
    {
      id: 'evt-002',
      type: 'plugin.loaded',
      source: 'plugin-manager',
      timestamp: timestamp(4),
      payloadPreview: '{"pluginId":"example.telemetry.demo"}',
    },
    {
      id: 'evt-003',
      type: 'telemetry.normalized.updated',
      source: 'example.telemetry.demo',
      timestamp: timestamp(2),
      payloadPreview: '{"temperatureC":21.75,"humidityPercent":42.2}',
    },
    {
      id: 'evt-004',
      type: 'plugin.stopped',
      source: 'plugin-manager',
      timestamp: timestamp(1),
      payloadPreview: '{"pluginId":"example.telemetry.demo"}',
    },
  ],
};

export const defaultWorkspaceId = mockShellSnapshot.workspaces[0]?.id ?? 'operator-default';

export const getSidebarItemsForSection = (section: ShellSectionId) => mockShellSnapshot.sidebarItems[section] ?? [];

export const getWorkspaceById = (workspaceId: string) =>
  mockShellSnapshot.workspaces.find((workspace) => workspace.id === workspaceId) ?? mockShellSnapshot.workspaces[0];

export const initialShellSection: ShellSectionId = defaultShellSection;
