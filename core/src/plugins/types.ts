import type { EventBus } from "../bus/index.js";

export type NexusPluginManifest = {
  id: string;
  name: string;
  version: string;
  requiredServices?: string[];
  requiredCapabilities?: string[];
};

export type PluginContext = {
  eventBus: EventBus;
};

export type NexusPlugin = {
  manifest: NexusPluginManifest;
  onLoad?(context: PluginContext): Promise<void> | void;
  onStart?(context: PluginContext): Promise<void> | void;
  onStop?(context: PluginContext): Promise<void> | void;
};

export interface PluginManager {
  register(plugin: NexusPlugin): void;
  loadAll(): Promise<void>;
  startAll(): Promise<void>;
  stopAll(): Promise<void>;
  get(id: string): NexusPlugin | undefined;
  list(): NexusPlugin[];
}
