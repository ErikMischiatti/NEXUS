import type { EventBus } from "../bus/index.js";
import { BasicPluginRegistry, type PluginRegistry } from "./registry/index.js";
import type {
  NexusPlugin,
  PluginContext,
  PluginManager,
} from "./types.js";

type PluginRecord = {
  plugin: NexusPlugin;
};

/**
 * Minimal in-memory plugin manager.
 *
 * Lifecycle is explicit: register -> loadAll -> startAll -> stopAll.
 * Methods are sequential and fail fast on the first lifecycle error.
 */
export class BasicPluginManager implements PluginManager {
  private readonly recordsById = new Map<string, PluginRecord>();
  private readonly registrationOrder: string[] = [];
  private readonly startedOrder: string[] = [];
  readonly registry: PluginRegistry;

  constructor(private readonly context: PluginContext) {
    this.registry = new BasicPluginRegistry();
  }

  register(plugin: NexusPlugin): void {
    const entry = this.registry.register(plugin.manifest);
    plugin.manifest = entry.manifest;

    this.recordsById.set(entry.manifest.id, { plugin });
    this.registrationOrder.push(entry.manifest.id);
  }

  async loadAll(): Promise<void> {
    for (const id of this.registrationOrder) {
      const record = this.recordsById.get(id);
      const entry = this.registry.get(id);
      if (!record || !entry || entry.state !== "REGISTERED") {
        continue;
      }

      try {
        await record.plugin.onLoad?.(this.context);
        this.registry.updateState(id, "LOADED");
      } catch (error) {
        this.registry.updateState(id, "FAILED", error);
        throw error;
      }
    }
  }

  async startAll(): Promise<void> {
    for (const id of this.registrationOrder) {
      const record = this.recordsById.get(id);
      const entry = this.registry.get(id);
      if (!record || !entry || entry.state === "STARTED") {
        continue;
      }

      if (entry.state !== "LOADED") {
        throw new Error(`Plugin "${id}" must be loaded before startAll().`);
      }

      try {
        await record.plugin.onStart?.(this.context);
        this.registry.updateState(id, "STARTED");
        this.startedOrder.push(id);
      } catch (error) {
        this.registry.updateState(id, "FAILED", error);
        throw error;
      }
    }
  }

  async stopAll(): Promise<void> {
    const order = [...this.startedOrder].reverse();
    const stillStarted: string[] = [];

    try {
      for (const id of order) {
        const record = this.recordsById.get(id);
        const entry = this.registry.get(id);
        if (!record || !entry || entry.state !== "STARTED") {
          continue;
        }

        try {
          await record.plugin.onStop?.(this.context);
          this.registry.updateState(id, "STOPPED");
        } catch (error) {
          this.registry.updateState(id, "FAILED", error);
          throw error;
        }
      }
    } finally {
      for (const id of this.startedOrder) {
        const entry = this.registry.get(id);
        if (entry?.state === "STARTED") {
          stillStarted.push(id);
        }
      }

      this.startedOrder.splice(0, this.startedOrder.length, ...stillStarted);
    }
  }

  get(id: string): NexusPlugin | undefined {
    return this.recordsById.get(id)?.plugin;
  }

  list(): NexusPlugin[] {
    return this.registrationOrder.flatMap((id) => {
      const record = this.recordsById.get(id);
      return record ? [record.plugin] : [];
    });
  }
}

export const createPluginContext = (eventBus: EventBus): PluginContext => ({
  eventBus,
});
