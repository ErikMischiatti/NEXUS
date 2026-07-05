import { pluginViewRegistry } from '@/plugins/plugin-view-registry';
import { telemetryDemoPluginView } from '@/plugins/telemetry-demo/plugin-view';

pluginViewRegistry.register(telemetryDemoPluginView);

export { TelemetryDemoView } from '@/plugins/telemetry-demo/TelemetryDemoView';
export { telemetryDemoPluginView } from '@/plugins/telemetry-demo/plugin-view';
