import { describe, expect, it } from "vitest";
import {
  BasicPluginManager,
  InMemoryEventBus,
  PluginManifestValidationError,
  createPluginContext,
  type NexusPlugin,
} from "../src/index.js";

const createPlugin = (
  id: string,
  hooks: Partial<NexusPlugin> = {},
  manifestOverrides: Partial<NexusPlugin["manifest"]> = {},
): NexusPlugin => ({
  manifest: {
    id,
    name: id,
    version: "1.0.0",
    ...manifestOverrides,
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
    expect(manager.registry.get("alpha")?.state).toBe("REGISTERED");
  });

  it("creates a plugin context with only public SDK fields by default", () => {
    const eventBus = new InMemoryEventBus();
    const context = createPluginContext(eventBus);

    expect(context).toEqual({ eventBus });
    expect(context.logger).toBeUndefined();
    expect(context.services).toBeUndefined();
  });

  it("accepts optional manifest metadata during registration", () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });
    const plugin = createPlugin("meta", {}, {
      description: "Example plugin",
      author: "NEXUS",
      entrypoint: "./dist/index.js",
      requiredServices: ["eventBus"],
      requiredCapabilities: ["telemetry"],
      compatibility: {
        nexusCore: ">=2.1.0 <3.0.0",
        pluginApi: "^1.0.0",
      },
    });

    manager.register(plugin);

    expect(manager.get("meta")).toBe(plugin);
    expect(manager.list()[0]?.manifest).toMatchObject({
      description: "Example plugin",
      author: "NEXUS",
      entrypoint: "./dist/index.js",
      requiredServices: ["eventBus"],
      requiredCapabilities: ["telemetry"],
      compatibility: {
        nexusCore: ">=2.1.0 <3.0.0",
        pluginApi: "^1.0.0",
      },
    });
  });

  it("rejects invalid manifests during registration", () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });

    expect(() =>
      manager.register({
        manifest: {
          id: "plugin.invalid",
          name: " ",
          version: "1.0.0",
        },
      } as NexusPlugin),
    ).toThrow(PluginManifestValidationError);
  });

  it("uses the normalized manifest id for duplicate detection", () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });

    manager.register(createPlugin("  alpha  "));

    expect(() => manager.register(createPlugin("alpha"))).toThrow(
      'Plugin with id "alpha" is already registered.',
    );
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
    expect(manager.registry.listByState("STOPPED").map((entry) => entry.manifest.id)).toEqual([
      "alpha",
      "beta",
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
    expect(manager.registry.get("alpha")?.state).toBe("FAILED");
    expect(manager.registry.get("alpha")?.lastLifecycleError).toBe(error);
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
    expect(manager.registry.listByState("STOPPED").map((entry) => entry.manifest.id)).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  it("keeps registry state consistent after lifecycle events", async () => {
    const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });

    manager.register(
      createPlugin("alpha", {
        onLoad: () => undefined,
        onStart: () => undefined,
        onStop: () => undefined,
      }),
    );

    expect(manager.registry.get("alpha")?.state).toBe("REGISTERED");

    await manager.loadAll();
    expect(manager.registry.get("alpha")?.state).toBe("LOADED");

    await manager.startAll();
    expect(manager.registry.get("alpha")?.state).toBe("STARTED");

    await manager.stopAll();
    expect(manager.registry.get("alpha")?.state).toBe("STOPPED");
  });
});
