import { describe, expect, it } from "vitest";
import {
  config as configKey,
  eventBus as eventBusKey,
  loggerFactory as loggerFactoryKey,
  createRuntime,
  type NexusPlugin,
} from "../src/index.js";

const createPlugin = (hooks: Partial<NexusPlugin> = {}): NexusPlugin => ({
  manifest: {
    id: "demo-plugin",
    name: "demo-plugin",
    version: "1.0.0",
  },
  ...hooks,
});

describe("BasicRuntime", () => {
  it("can be created", () => {
    const runtime = createRuntime();

    expect(runtime.state).toBe("stopped");
    expect(runtime.eventBus).toBeDefined();
    expect(runtime.services).toBeDefined();
  });

  it("starts and stops cleanly", async () => {
    const runtime = createRuntime({
      config: {
        runtime: {
          name: "demo-runtime",
          logLevel: "debug",
        },
        plugins: {
          enabled: [],
          paths: [],
        },
      },
    });

    await runtime.start();
    expect(runtime.state).toBe("running");

    await runtime.stop();
    expect(runtime.state).toBe("stopped");
  });

  it("publishes started and stopped events", async () => {
    const runtime = createRuntime();
    const events: string[] = [];

    runtime.eventBus.subscribe("core.runtime.started", () => {
      events.push("started");
    });
    runtime.eventBus.subscribe("core.runtime.stopped", () => {
      events.push("stopped");
    });

    await runtime.start();
    await runtime.stop();

    expect(events).toEqual(["started", "stopped"]);
  });

  it("registers and runs plugin lifecycle hooks", async () => {
    const runtime = createRuntime();
    const calls: string[] = [];

    runtime.registerPlugin(
      createPlugin({
        onLoad: (context) => {
          calls.push("load");
          expect(context.eventBus).toBe(runtime.eventBus);
        },
        onStart: (context) => {
          calls.push("start");
          expect(context.eventBus).toBe(runtime.eventBus);
        },
        onStop: () => {
          calls.push("stop");
        },
      }),
    );

    await runtime.start();
    await runtime.stop();

    expect(calls).toEqual(["load", "start", "stop"]);
  });

  it("registers core services", async () => {
    const runtime = createRuntime();

    await runtime.start();

    expect(runtime.services.has(eventBusKey)).toBe(true);
    expect(runtime.services.has(configKey)).toBe(true);
    expect(runtime.services.has(loggerFactoryKey)).toBe(true);
    expect(runtime.services.get(eventBusKey)).toBe(runtime.eventBus);
    expect(runtime.services.get(configKey).runtime.name).toBe("nexus-runtime");
    expect(runtime.services.get(loggerFactoryKey)).toBeDefined();
  });

  it("handles start and stop failures clearly", async () => {
    const runtime = createRuntime();
    const startError = new Error("start failed");
    const stopError = new Error("stop failed");

    runtime.registerPlugin(
      createPlugin({
        onLoad: () => undefined,
        onStart: () => {
          throw startError;
        },
      }),
    );

    await expect(runtime.start()).rejects.toThrow("start failed");

    const stopRuntime = createRuntime();
    stopRuntime.registerPlugin(
      createPlugin({
        onStop: () => {
          throw stopError;
        },
      }),
    );

    await stopRuntime.start();
    await expect(stopRuntime.stop()).rejects.toThrow("stop failed");
  });
});
