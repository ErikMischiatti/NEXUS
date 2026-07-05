export {
  createMockRuntimeSnapshot,
  defaultPanelId as defaultWorkspacePanelId,
  defaultWorkspaceId,
  initialShellSection,
  mockRuntimeSnapshot as mockShellSnapshot,
} from './mock-runtime-snapshot';
export type {
  ConnectionSnapshot as ShellConnectionSnapshot,
  EventSeverity as ShellEventSeverity,
  EventSnapshot as ShellEvent,
  PanelRegion as ShellPanelRegion,
  PanelSnapshot as ShellPanel,
  PanelStatus as ShellPanelStatus,
  PluginSnapshot as ShellPlugin,
  PluginStatus as ShellPluginStatus,
  RuntimeInfoSnapshot as ShellRuntimeInfoSnapshot,
  RuntimeMode as ShellRuntimeMode,
  RuntimeSnapshot as ShellSnapshot,
  RuntimeState as ShellRuntimeState,
  WorkspaceSnapshot as ShellWorkspace,
} from '../types/runtime-snapshot';
