import { validatePluginManifest } from "../manifest-validation.js";
import type { NexusPluginManifest } from "../types.js";

export type PluginRegistryState =
  | "REGISTERED"
  | "LOADED"
  | "STARTED"
  | "STOPPED"
  | "FAILED";

export type PluginRegistryEntry = {
  manifest: NexusPluginManifest;
  state: PluginRegistryState;
  registeredAt: string;
  lastLifecycleError?: unknown;
};

export interface PluginRegistry {
  register(manifest: NexusPluginManifest): PluginRegistryEntry;
  updateState(
    id: string,
    state: PluginRegistryState,
    lastLifecycleError?: unknown,
  ): PluginRegistryEntry;
  get(id: string): PluginRegistryEntry | undefined;
  list(): PluginRegistryEntry[];
  exists(id: string): boolean;
  remove(id: string): boolean;
  listByState(state: PluginRegistryState): PluginRegistryEntry[];
}

type RegistryRecord = PluginRegistryEntry;

export class BasicPluginRegistry implements PluginRegistry {
  private readonly entriesById = new Map<string, RegistryRecord>();
  private readonly registrationOrder: string[] = [];

  register(manifest: NexusPluginManifest): PluginRegistryEntry {
    const normalizedManifest = validatePluginManifest(manifest);
    const { id } = normalizedManifest;

    if (this.entriesById.has(id)) {
      throw new Error(`Plugin with id "${id}" is already registered.`);
    }

    const entry: PluginRegistryEntry = {
      manifest: normalizedManifest,
      state: "REGISTERED",
      registeredAt: new Date().toISOString(),
    };

    this.entriesById.set(id, entry);
    this.registrationOrder.push(id);

    return entry;
  }

  updateState(
    id: string,
    state: PluginRegistryState,
    lastLifecycleError?: unknown,
  ): PluginRegistryEntry {
    const entry = this.entriesById.get(id);
    if (!entry) {
      throw new Error(`Plugin with id "${id}" is not registered.`);
    }

    entry.state = state;
    if (lastLifecycleError === undefined) {
      delete entry.lastLifecycleError;
    } else {
      entry.lastLifecycleError = lastLifecycleError;
    }

    return entry;
  }

  get(id: string): PluginRegistryEntry | undefined {
    return this.entriesById.get(id);
  }

  list(): PluginRegistryEntry[] {
    return this.registrationOrder.flatMap((id) => {
      const entry = this.entriesById.get(id);
      return entry ? [entry] : [];
    });
  }

  exists(id: string): boolean {
    return this.entriesById.has(id);
  }

  remove(id: string): boolean {
    const removed = this.entriesById.delete(id);
    if (!removed) {
      return false;
    }

    const index = this.registrationOrder.indexOf(id);
    if (index >= 0) {
      this.registrationOrder.splice(index, 1);
    }

    return true;
  }

  listByState(state: PluginRegistryState): PluginRegistryEntry[] {
    return this.list().filter((entry) => entry.state === state);
  }
}
