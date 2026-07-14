import { pluginViewRegistry, type PluginViewRegistry } from '@/plugins/plugin-view-registry';
import { telemetryDemoPluginView } from '@/plugins/telemetry-demo/plugin-view';

export const registerTelemetryDemoPluginView = (registry: PluginViewRegistry = pluginViewRegistry) => {
  registry.register(telemetryDemoPluginView);
};

export { TelemetryDemoView } from '@/plugins/telemetry-demo/TelemetryDemoView';
export { telemetryDemoPluginView } from '@/plugins/telemetry-demo/plugin-view';
