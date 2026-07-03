import type { EventBus } from "../bus/index.js";
import type { Logger } from "../logging/index.js";
import type { ServiceContainer } from "../di/index.js";
import type { PluginRegistry } from "./registry/index.js";

export type NexusPluginCompatibility = {
  nexusCore?: string;
  pluginApi?: string;
};

export type NexusPluginManifest = {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  entrypoint?: string;
  requiredServices?: string[];
  requiredCapabilities?: string[];
  compatibility?: NexusPluginCompatibility;
};

export type PluginServices = Pick<
  ServiceContainer,
  "get" | "optional" | "has"
>;

export type PluginContext = {
  eventBus: EventBus;
  logger?: Logger;
  services?: PluginServices;
};

export type NexusPlugin = {
  manifest: NexusPluginManifest;
  onLoad?(context: PluginContext): Promise<void> | void;
  onStart?(context: PluginContext): Promise<void> | void;
  onStop?(context: PluginContext): Promise<void> | void;
};

export interface PluginManager {
  readonly registry: PluginRegistry;
  register(plugin: NexusPlugin): void;
  loadAll(): Promise<void>;
  startAll(): Promise<void>;
  stopAll(): Promise<void>;
  get(id: string): NexusPlugin | undefined;
  list(): NexusPlugin[];
}
