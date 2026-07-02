import { describe, expect, it } from "vitest";
import {
  BasicServiceContainer,
  createDefaultConfig,
  createLogger,
  createServiceKey,
  type LoggerFactory,
} from "../src/index.js";
import { config, eventBus, loggerFactory } from "../src/index.js";

describe("BasicServiceContainer", () => {
  it("registers and retrieves services", () => {
    const container = new BasicServiceContainer();
    const key = createServiceKey<{ value: string }>("custom");
    const value = { value: "ok" };

    container.register(key, value);

    expect(container.get(key)).toBe(value);
    expect(container.optional(key)).toBe(value);
    expect(container.has(key)).toBe(true);
  });

  it("rejects duplicate registration", () => {
    const container = new BasicServiceContainer();
    const key = createServiceKey<string>("custom");

    container.register(key, "one");

    expect(() => container.register(key, "two")).toThrow(
      'Service "custom" is already registered.',
    );
  });

  it("throws for missing services", () => {
    const container = new BasicServiceContainer();
    const key = createServiceKey<string>("missing");

    expect(() => container.get(key)).toThrow(
      'Service "missing" is not registered.',
    );
  });

  it("returns undefined for optional missing services", () => {
    const container = new BasicServiceContainer();
    const key = createServiceKey<string>("missing");

    expect(container.optional(key)).toBeUndefined();
  });

  it("lists keys in registration order", () => {
    const container = new BasicServiceContainer();
    const first = createServiceKey<string>("first");
    const second = createServiceKey<string>("second");

    container.register(second, "two");
    container.register(first, "one");

    expect(container.listKeys().map((key) => key.name)).toEqual([
      "second",
      "first",
    ]);
  });

  it("exposes predefined core service keys", () => {
    const container = new BasicServiceContainer();
    const loggerFactoryValue: LoggerFactory = {
      create: createLogger,
    };

    container.register(eventBus, { publish: async () => undefined, subscribe: () => ({ id: "1", type: "a" }), unsubscribe: () => undefined });
    container.register(config, createDefaultConfig());
    container.register(loggerFactory, loggerFactoryValue);

    expect(container.has(eventBus)).toBe(true);
    expect(container.has(config)).toBe(true);
    expect(container.has(loggerFactory)).toBe(true);
    expect(container.get(config)).toEqual(createDefaultConfig());
    expect(container.get(loggerFactory)).toBe(loggerFactoryValue);
    expect(container.listKeys().map((key) => key.name)).toEqual([
      "eventBus",
      "config",
      "loggerFactory",
    ]);
  });
});
