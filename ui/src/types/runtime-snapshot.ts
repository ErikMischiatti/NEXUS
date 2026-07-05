export type RuntimeMode = 'mock';
export type RuntimeState = 'ready' | 'idle' | 'degraded' | 'error';

export type PluginStatus = 'ready' | 'placeholder' | 'mock';
export type PanelRegion = 'main' | 'right' | 'bottom';
export type PanelStatus = 'ready' | 'placeholder' | 'mock';
export type EventSeverity = 'info' | 'success' | 'warning' | 'debug';
export type ConnectionState = 'mock' | 'connected' | 'disconnected';

export interface RuntimeInfoSnapshot {
  id: string;
  name: string;
  mode: RuntimeMode;
  state: RuntimeState;
  uptimeLabel: string;
}

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  description: string;
  sessionLabel: string;
  sourceLabel: string;
}

export interface PluginSnapshot {
  id: string;
  name: string;
  status: PluginStatus;
  description: string;
  version?: string;
}

export interface PanelSnapshot {
  id: string;
  title: string;
  pluginId: string;
  region: PanelRegion;
  status: PanelStatus;
  description: string;
}

export interface EventSnapshot {
  id: string;
  time: string;
  severity: EventSeverity;
  source: string;
  type: string;
  description: string;
  payloadPreview?: string;
}

export interface ConnectionSnapshot {
  state: ConnectionState;
  label: string;
  isMock: boolean;
}

export interface RuntimeSnapshot {
  runtime: RuntimeInfoSnapshot;
  workspace: WorkspaceSnapshot;
  workspaces: WorkspaceSnapshot[];
  plugins: PluginSnapshot[];
  panels: PanelSnapshot[];
  events: EventSnapshot[];
  connection: ConnectionSnapshot;
}
