import type { ComponentType } from 'react';

export type PluginViewComponentProps = Record<string, never>;

export interface PluginViewDefinition {
  id: string;
  title: string;
  pluginId: string;
  component: ComponentType<PluginViewComponentProps>;
}
