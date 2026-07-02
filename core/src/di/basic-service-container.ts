import type { ServiceContainer, ServiceKey } from "./types.js";

type StoredEntry = {
  key: ServiceKey<unknown>;
  value: unknown;
};

export class BasicServiceContainer implements ServiceContainer {
  private readonly entries = new Map<symbol, StoredEntry>();
  private readonly orderedKeys: ServiceKey<unknown>[] = [];

  register<T>(key: ServiceKey<T>, value: T): void {
    if (this.entries.has(key.token)) {
      throw new Error(`Service "${key.name}" is already registered.`);
    }

    this.entries.set(key.token, { key, value });
    this.orderedKeys.push(key);
  }

  get<T>(key: ServiceKey<T>): T {
    const entry = this.entries.get(key.token);
    if (!entry) {
      throw new Error(`Service "${key.name}" is not registered.`);
    }

    return entry.value as T;
  }

  optional<T>(key: ServiceKey<T>): T | undefined {
    return this.entries.get(key.token)?.value as T | undefined;
  }

  has<T>(key: ServiceKey<T>): boolean {
    return this.entries.has(key.token);
  }

  listKeys(): ServiceKey<unknown>[] {
    return [...this.orderedKeys];
  }
}
