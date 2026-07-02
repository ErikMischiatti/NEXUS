import { describe, expect, it } from "vitest";
import {
  BasicPluginManager,
  InMemoryEventBus,
  type NexusPlugin,
} from "../src/index.js";

const createPlugin = (
  id: string,
  hooks: Partial<NexusPlugin> = {},
): NexusPlugin => ({
  manifest: {
    id,
    name: id,
    version: "1.0.0",
  },
  ...hooks,
});

describe("BasicPluginManager", () => {
  it("registers a plugin", () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });
    const plugin = createPlugin("alpha");

    manager.register(plugin);

    expect(manager.get("alpha")).toBe(plugin);
    expect(manager.list()).toEqual([plugin]);
  });

  it("rejects duplicate plugin IDs", () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });

    manager.register(createPlugin("alpha"));

    expect(() => manager.register(createPlugin("alpha"))).toThrow(
      'Plugin with id "alpha" is already registered.',
    );
  });

  it("runs load, start, and stop lifecycle hooks in deterministic order", async () => {
    const bus = new InMemoryEventBus();
    const manager = new BasicPluginManager({ eventBus: bus });
    const calls: string[] = [];

    manager.register(
      createPlugin("alpha", {
        onLoad: (context) => {
          calls.push("load:alpha");
          expect(context.eventBus).toBe(bus);
        },
        onStart: () => {
          calls.push("start:alpha");
        },
        onStop: () => {
          calls.push("stop:alpha");
        },
      }),
    );
    manager.register(
      createPlugin("beta", {
        onLoad: () => {
          calls.push("load:beta");
        },
        onStart: () => {
          calls.push("start:beta");
        },
        onStop: () => {
          calls.push("stop:beta");
        },
      }),
    );

    await manager.loadAll();
    await manager.startAll();
    await manager.stopAll();

    expect(calls).toEqual([
      "load:alpha",
      "load:beta",
      "start:alpha",
      "start:beta",
      "stop:beta",
      "stop:alpha",
    ]);
  });

  it("rejects lifecycle errors clearly", async () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });
    const error = new Error("start failed");

    manager.register(
      createPlugin("alpha", {
        onLoad: () => undefined,
        onStart: () => {
          throw error;
        },
      }),
    );

    await manager.loadAll();

    await expect(manager.startAll()).rejects.toThrow("start failed");
  });

  it("stops started plugins in reverse startup order", async () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });
    const calls: string[] = [];

    manager.register(
      createPlugin("alpha", {
        onStop: () => {
          calls.push("stop:alpha");
        },
      }),
    );
    manager.register(
      createPlugin("beta", {
        onStop: () => {
          calls.push("stop:beta");
        },
      }),
    );
    manager.register(
      createPlugin("gamma", {
        onStop: () => {
          calls.push("stop:gamma");
        },
      }),
    );

    await manager.loadAll();
    await manager.startAll();
    await manager.stopAll();

    expect(calls).toEqual(["stop:gamma", "stop:beta", "stop:alpha"]);
  });
});
