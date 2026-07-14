import { describe, expect, it, vi } from 'vitest';
import { createPluginViewRegistry, bootstrapPluginViews } from '@/plugins';
import { telemetryDemoPluginView } from '@/plugins/telemetry-demo/plugin-view';

const AlternateTelemetryDemoView = () => null;

describe('plugin view bootstrap', () => {
  it('does not register Telemetry Demo just by importing the registry', async () => {
    vi.resetModules();

    const { pluginViewRegistry } = await import('@/plugins/plugin-view-registry');

    expect(pluginViewRegistry.has('example.telemetry.demo')).toBe(false);
  });

  it('registers Telemetry Demo through an explicit bootstrap and keeps it idempotent', () => {
    const registry = createPluginViewRegistry();

    bootstrapPluginViews(registry);
    bootstrapPluginViews(registry);

    expect(registry.list()).toHaveLength(1);
    expect(registry.get('example.telemetry.demo')).toBe(telemetryDemoPluginView);
  });

  it('surfaces conflicting registrations instead of hiding them behind a presence check', () => {
    const registry = createPluginViewRegistry();
    registry.register({
      ...telemetryDemoPluginView,
      component: AlternateTelemetryDemoView,
    });

    expect(() => bootstrapPluginViews(registry)).toThrow(
      'Plugin view already registered for plugin id example.telemetry.demo',
    );
  });

  it('falls back cleanly when a plugin view is missing', () => {
    const registry = createPluginViewRegistry();

    expect(registry.get('future.map.plugin')).toBeUndefined();
  });
});
