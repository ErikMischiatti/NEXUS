import type { PluginViewDefinition } from '@/plugins/plugin-view';

export interface PluginViewRegistry {
  register: (view: PluginViewDefinition) => void;
  get: (pluginId: string) => PluginViewDefinition | undefined;
  list: () => PluginViewDefinition[];
}

export const createPluginViewRegistry = (initialViews: PluginViewDefinition[] = []): PluginViewRegistry => {
  const views = new Map<string, PluginViewDefinition>();
  initialViews.forEach((view) => {
    views.set(view.pluginId, view);
  });

  return {
    register: (view) => {
      views.set(view.pluginId, view);
    },
    get: (pluginId) => views.get(pluginId),
    list: () => [...views.values()],
  };
};

export const pluginViewRegistry = createPluginViewRegistry();
