import { createPluginViewRegistry } from '@/plugins';
import { telemetryDemoPluginView } from '@/plugins/telemetry-demo/plugin-view';

describe('plugin view registry', () => {
  it('registers and looks up views by plugin id', () => {
    const registry = createPluginViewRegistry();

    registry.register(telemetryDemoPluginView);

    expect(registry.get('example.telemetry.demo')).toBe(telemetryDemoPluginView);
    expect(registry.list()).toEqual([telemetryDemoPluginView]);
  });

  it('replaces an existing view for the same plugin id', () => {
    const registry = createPluginViewRegistry();
    const replacement = {
      ...telemetryDemoPluginView,
      id: 'telemetry-demo-view-alt',
      title: 'Telemetry Demo Alt',
    };

    registry.register(telemetryDemoPluginView);
    registry.register(replacement);

    expect(registry.get('example.telemetry.demo')).toBe(replacement);
    expect(registry.list()).toEqual([replacement]);
  });
});
