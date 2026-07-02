import type { NexusConfig, ConfigLoader } from "../config/index.js";
import type { EventBus } from "../bus/index.js";
import type { Logger, LoggerFactory } from "../logging/index.js";
import type { NexusPlugin } from "../plugins/index.js";
import type { BasicServiceContainer, ServiceContainer } from "../di/index.js";
import type { BasicPluginManager, PluginManager } from "../plugins/index.js";

export type RuntimeOptions = {
  config?: Partial<NexusConfig>;
  configLoader?: ConfigLoader;
  loggerFactory?: LoggerFactory;
};

export type RuntimeState = "stopped" | "starting" | "running" | "stopping";

export type RuntimeServices = ServiceContainer & {
  readonly name: string;
  readonly eventBus: EventBus;
};

export type RuntimeSnapshot = {
  config: NexusConfig | undefined;
  loggerFactory: LoggerFactory | undefined;
  logger: Logger | undefined;
  services: BasicServiceContainer;
  pluginManager: BasicPluginManager;
  state: RuntimeState;
};

export interface RuntimeHandle {
  readonly eventBus: EventBus;
  readonly config: NexusConfig | undefined;
  readonly loggerFactory: LoggerFactory | undefined;
  readonly logger: Logger | undefined;
  readonly services: ServiceContainer;
  readonly pluginManager: PluginManager;
  readonly state: RuntimeState;
  registerPlugin(plugin: NexusPlugin): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}
