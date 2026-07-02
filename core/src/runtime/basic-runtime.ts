import { randomUUID } from "node:crypto";
import { InMemoryEventBus, type NexusEvent } from "../bus/index.js";
import { BasicServiceContainer, config as configKey, eventBus as eventBusKey, loggerFactory as loggerFactoryKey } from "../di/index.js";
import { BasicConfigLoader, type ConfigLoader, type NexusConfig } from "../config/index.js";
import { BasicLoggerFactory, type Logger, type LoggerFactory } from "../logging/index.js";
import { BasicPluginManager, createPluginContext } from "../plugins/index.js";
import type { NexusPlugin, PluginManager } from "../plugins/index.js";
import type { RuntimeHandle, RuntimeOptions } from "./types.js";

type RuntimeState = "stopped" | "starting" | "running" | "stopping";

export class BasicRuntime implements RuntimeHandle {
  private readonly eventBusImpl = new InMemoryEventBus();
  private readonly servicesContainer = new BasicServiceContainer();
  private readonly pluginManagerImpl = new BasicPluginManager(
    createPluginContext(this.eventBusImpl),
  );
  private readonly configLoader: ConfigLoader;
  private loggerFactoryImpl: LoggerFactory | undefined;
  private loggerImpl: Logger | undefined;
  private configImpl: NexusConfig | undefined;
  private stateImpl: RuntimeState = "stopped";
  private startedSuccessfully = false;
  private stoppedSuccessfully = false;
  private startAttempted = false;

  constructor(private readonly options: RuntimeOptions = {}) {
    this.configLoader =
      options.configLoader ?? new BasicConfigLoader(options.config);
  }

  get name(): string {
    return this.configImpl?.runtime.name ?? this.options.config?.runtime?.name ?? "nexus-runtime";
  }

  get eventBus(): InMemoryEventBus {
    return this.eventBusImpl;
  }

  get config(): NexusConfig | undefined {
    return this.configImpl;
  }

  get loggerFactory(): LoggerFactory | undefined {
    return this.loggerFactoryImpl;
  }

  get logger(): Logger | undefined {
    return this.loggerImpl;
  }

  get services(): BasicServiceContainer {
    return this.servicesContainer;
  }

  get pluginManager(): PluginManager {
    return this.pluginManagerImpl;
  }

  get state(): RuntimeState {
    return this.stateImpl;
  }

  registerPlugin(plugin: NexusPlugin): void {
    if (this.startAttempted || this.stateImpl !== "stopped") {
      throw new Error("Plugins can only be registered before runtime start.");
    }
    this.pluginManagerImpl.register(plugin);
  }

  async start(): Promise<void> {
    if (this.startAttempted || this.stateImpl !== "stopped") {
      throw new Error("Runtime has already been started.");
    }

    this.stateImpl = "starting";
    this.startAttempted = true;

    try {
      this.configImpl = await this.configLoader.load();
      this.loggerFactoryImpl =
        this.options.loggerFactory ??
        new BasicLoggerFactory({ minLevel: this.configImpl.runtime.logLevel });
      this.loggerImpl = this.loggerFactoryImpl.create("core.runtime");

      this.servicesContainer.register(eventBusKey, this.eventBusImpl);
      this.servicesContainer.register(configKey, this.configImpl);
      this.servicesContainer.register(loggerFactoryKey, this.loggerFactoryImpl);

      await this.pluginManagerImpl.loadAll();
      await this.pluginManagerImpl.startAll();

      await this.eventBusImpl.publish(this.createLifecycleEvent("core.runtime.started"));

      this.startedSuccessfully = true;
      this.stateImpl = "running";
    } catch (error) {
      this.stateImpl = "stopped";
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.startedSuccessfully || this.stoppedSuccessfully) {
      return;
    }

    if (this.stateImpl !== "running") {
      throw new Error("Runtime is not running.");
    }

    this.stateImpl = "stopping";

    try {
      await this.pluginManagerImpl.stopAll();
      await this.eventBusImpl.publish(this.createLifecycleEvent("core.runtime.stopped"));
      this.stateImpl = "stopped";
      this.stoppedSuccessfully = true;
    } catch (error) {
      this.stateImpl = "running";
      throw error;
    }
  }

  private createLifecycleEvent(type: string): NexusEvent<{ runtime: string }> {
    if (!this.configImpl) {
      throw new Error("Runtime configuration is not available.");
    }

    return {
      id: randomUUID(),
      type,
      source: "core.runtime",
      timestamp: new Date().toISOString(),
      payload: {
        runtime: this.configImpl.runtime.name,
      },
    };
  }
}

export const createRuntime = (options?: RuntimeOptions | string): BasicRuntime =>
  new BasicRuntime(
    typeof options === "string"
      ? {
          config: {
            runtime: { name: options, logLevel: "info" },
            plugins: { enabled: [], paths: [] },
          },
        }
      : options,
  );
