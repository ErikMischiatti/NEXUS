import type { PluginViewDefinition } from '@/plugins/plugin-view';

export interface PluginViewRegistry {
  register: (view: PluginViewDefinition) => void;
  get: (pluginId: string) => PluginViewDefinition | undefined;
  list: () => PluginViewDefinition[];
  has: (pluginId: string) => boolean;
}

const isSameContribution = (existing: PluginViewDefinition, view: PluginViewDefinition) =>
  existing.id === view.id &&
  existing.title === view.title &&
  existing.pluginId === view.pluginId &&
  existing.component === view.component;

export const createPluginViewRegistry = (initialViews: PluginViewDefinition[] = []): PluginViewRegistry => {
  const views = new Map<string, PluginViewDefinition>();
  initialViews.forEach((view) => {
    const existing = views.get(view.pluginId);
    if (existing) {
      if (isSameContribution(existing, view)) {
        return;
      }
      throw new Error(`Plugin view already registered for plugin id ${view.pluginId}`);
    }
    views.set(view.pluginId, view);
  });

  return {
    register: (view) => {
      const existing = views.get(view.pluginId);
      if (existing) {
        if (isSameContribution(existing, view)) {
          return;
        }
        throw new Error(`Plugin view already registered for plugin id ${view.pluginId}`);
      }
      views.set(view.pluginId, view);
    },
    get: (pluginId) => views.get(pluginId),
    list: () => [...views.values()],
    has: (pluginId) => views.has(pluginId),
  };
};

export const pluginViewRegistry = createPluginViewRegistry();
