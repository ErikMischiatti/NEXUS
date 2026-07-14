import { pluginViewRegistry, type PluginViewRegistry } from '@/plugins/plugin-view-registry';
import { registerTelemetryDemoPluginView } from '@/plugins/telemetry-demo';

export { createPluginViewRegistry, pluginViewRegistry } from '@/plugins/plugin-view-registry';
export type { PluginViewDefinition, PluginViewComponentProps } from '@/plugins/plugin-view';

export const bootstrapPluginViews = (registry: PluginViewRegistry = pluginViewRegistry) => {
  registerTelemetryDemoPluginView(registry);
};
