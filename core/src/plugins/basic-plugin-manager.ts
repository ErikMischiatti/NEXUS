import type { EventBus } from "../bus/index.js";
import type {
  NexusPlugin,
  PluginContext,
  PluginManager,
} from "./types.js";
import { validatePluginManifest } from "./manifest-validation.js";

type PluginRecord = {
  plugin: NexusPlugin;
  loaded: boolean;
  started: boolean;
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

  constructor(private readonly context: PluginContext) {}

  register(plugin: NexusPlugin): void {
    const manifest = validatePluginManifest(plugin.manifest);
    plugin.manifest = manifest;

    const { id } = manifest;
    if (this.recordsById.has(id)) {
      throw new Error(`Plugin with id "${id}" is already registered.`);
    }

    this.recordsById.set(id, {
      plugin,
      loaded: false,
      started: false,
    });
    this.registrationOrder.push(id);
  }

  async loadAll(): Promise<void> {
    for (const id of this.registrationOrder) {
      const record = this.recordsById.get(id);
      if (!record || record.loaded) {
        continue;
      }

      await record.plugin.onLoad?.(this.context);
      record.loaded = true;
    }
  }

  async startAll(): Promise<void> {
    for (const id of this.registrationOrder) {
      const record = this.recordsById.get(id);
      if (!record || record.started) {
        continue;
      }

      if (!record.loaded) {
        throw new Error(`Plugin "${id}" must be loaded before startAll().`);
      }

      await record.plugin.onStart?.(this.context);
      record.started = true;
      this.startedOrder.push(id);
    }
  }

  async stopAll(): Promise<void> {
    const order = [...this.startedOrder].reverse();
    const stillStarted: string[] = [];

    try {
      for (const id of order) {
        const record = this.recordsById.get(id);
        if (!record || !record.started) {
          continue;
        }

        await record.plugin.onStop?.(this.context);
        record.started = false;
      }
    } finally {
      for (const id of this.startedOrder) {
        const record = this.recordsById.get(id);
        if (record?.started) {
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
