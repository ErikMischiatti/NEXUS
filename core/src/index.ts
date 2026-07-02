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

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Logger = {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
};

export type CoreConfig = {
  runtime: {
    name: string;
    logLevel: LogLevel;
  };
  plugins: {
    enabled: boolean;
    paths: string[];
  };
};

export interface ServiceContainer {
  register<T>(key: string, value: T): void;
  get<T>(key: string): T | undefined;
}

export class Runtime {
  constructor(public readonly name: string = "nexus-core") {}

  start(): string {
    return `${this.name}:started`;
  }
}

export const createRuntime = (name?: string): Runtime => new Runtime(name);
