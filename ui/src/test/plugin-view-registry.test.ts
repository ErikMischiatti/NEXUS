import { createPluginViewRegistry } from '@/plugins';
import { telemetryDemoPluginView } from '@/plugins/telemetry-demo/plugin-view';

const AlternateTelemetryDemoView = () => null;

describe('plugin view registry', () => {
  it('registers and looks up views by plugin id', () => {
    const registry = createPluginViewRegistry();

    registry.register(telemetryDemoPluginView);

    expect(registry.has('example.telemetry.demo')).toBe(true);
    expect(registry.get('example.telemetry.demo')).toBe(telemetryDemoPluginView);
    expect(registry.list()).toEqual([telemetryDemoPluginView]);
  });

  it('treats the same contribution as idempotent', () => {
    const registry = createPluginViewRegistry();

    registry.register(telemetryDemoPluginView);
    registry.register(telemetryDemoPluginView);

    expect(registry.get('example.telemetry.demo')).toBe(telemetryDemoPluginView);
    expect(registry.list()).toEqual([telemetryDemoPluginView]);
  });

  it('treats a new object with the same component reference as idempotent', () => {
    const registry = createPluginViewRegistry();
    const duplicateContribution = { ...telemetryDemoPluginView };

    registry.register(telemetryDemoPluginView);
    registry.register(duplicateContribution);

    expect(registry.get('example.telemetry.demo')).toBe(telemetryDemoPluginView);
    expect(registry.list()).toEqual([telemetryDemoPluginView]);
  });

  it('rejects a conflicting contribution with a different component reference', () => {
    const registry = createPluginViewRegistry();
    const replacement = {
      ...telemetryDemoPluginView,
      component: AlternateTelemetryDemoView,
    };

    registry.register(telemetryDemoPluginView);

    expect(() => registry.register(replacement)).toThrow('Plugin view already registered for plugin id example.telemetry.demo');
  });

  it('rejects a conflicting contribution for the same plugin id', () => {
    const registry = createPluginViewRegistry();
    const replacement = {
      ...telemetryDemoPluginView,
      id: 'telemetry-demo-view-alt',
      title: 'Telemetry Demo Alt',
    };

    registry.register(telemetryDemoPluginView);

    expect(() => registry.register(replacement)).toThrow('Plugin view already registered for plugin id example.telemetry.demo');
  });
});
