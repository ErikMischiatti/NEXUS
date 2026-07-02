export { InMemoryEventBus } from "./bus/index.js";

export type {
  EventBus,
  EventHandler,
  EventSubscription,
  NexusEvent,
} from "./bus/index.js";

export { BasicPluginManager, createPluginContext } from "./plugins/index.js";

export type {
  NexusPlugin,
  NexusPluginManifest,
  PluginContext,
  PluginManager,
} from "./plugins/index.js";

export { BasicConfigLoader, createDefaultConfig } from "./config/index.js";

export type {
  ConfigLoader,
  NexusConfig,
  NexusPluginConfig,
  NexusRuntimeConfig,
} from "./config/index.js";

export { BasicLogger, BasicLoggerFactory, createLogger } from "./logging/index.js";

export type {
  LogContext,
  LogLevel,
  LogRecord,
  LogSink,
  Logger,
  LoggerFactory,
} from "./logging/index.js";

export {
  BasicServiceContainer,
  config,
  eventBus,
  loggerFactory,
} from "./di/index.js";

export type {
  ServiceContainer,
  ServiceKey,
} from "./di/index.js";

export { createServiceKey } from "./di/index.js";

export type CoreConfig = import("./config/index.js").NexusConfig;

export class Runtime {
  constructor(public readonly name: string = "nexus-core") {}

  start(): string {
    return `${this.name}:started`;
  }
}

export const createRuntime = (name?: string): Runtime => new Runtime(name);
