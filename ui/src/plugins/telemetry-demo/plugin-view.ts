import { TelemetryDemoView } from '@/plugins/telemetry-demo/TelemetryDemoView';
import type { PluginViewDefinition } from '@/plugins/plugin-view';

export const telemetryDemoPluginView: PluginViewDefinition = {
  id: 'telemetry-demo-view',
  title: 'Telemetry Demo',
  pluginId: 'example.telemetry.demo',
  component: TelemetryDemoView,
};
