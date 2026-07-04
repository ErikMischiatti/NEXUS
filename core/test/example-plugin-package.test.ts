import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BasicPluginManager,
  BasicPluginRegistry,
  InMemoryEventBus,
  LocalPluginDescriptorDiscovery,
  LocalPluginLoader,
  registerDiscoveredDescriptors,
  type NexusEvent,
} from "../src/index.js";

const telemetryDemoRoot = fileURLToPath(
  new URL("../../examples/plugins/telemetry-demo/", import.meta.url),
);
const telemetryDemoPluginsRoot = fileURLToPath(
  new URL("../../examples/plugins/", import.meta.url),
);

const createRawTelemetryEvent = (payload: {
  temperatureC: string;
  humidityPercent: string;
  source: string;
}): NexusEvent<typeof payload> => ({
  id: "telemetry-raw-1",
  type: "telemetry.raw.received",
  source: "telemetry-simulator",
  timestamp: new Date().toISOString(),
  payload,
});

describe("telemetry demo plugin package", () => {
  it("runs discovery through lifecycle and emits normalized telemetry", async () => {
    const discovery = new LocalPluginDescriptorDiscovery();
    const discovered = await discovery.discover(telemetryDemoPluginsRoot);

    expect(discovered.errors).toEqual([]);
    expect(discovered.descriptors).toHaveLength(1);
    expect(discovered.descriptors[0]?.source?.descriptorPath).toBe(
      join(telemetryDemoRoot, "nexus.plugin.json"),
    );

    const registry = new BasicPluginRegistry();
    const registryEntries = registerDiscoveredDescriptors(registry, discovered);

    expect(registryEntries).toHaveLength(1);
    expect(registry.listByState("REGISTERED")).toHaveLength(1);

    const loader = new LocalPluginLoader();
    const loaded = await loader.load(discovered.descriptors[0]!);

    if (!loaded.ok) {
      throw new Error(`${loaded.error.code}: ${loaded.error.message}`);
    }

    const bus = new InMemoryEventBus();
    const manager = new BasicPluginManager({ eventBus: bus });
    const normalizedEvents: NexusEvent<{
      source: string;
      temperatureC: number;
      humidityPercent: number;
    }>[] = [];

    bus.subscribe<{
      source: string;
      temperatureC: number;
      humidityPercent: number;
    }>("telemetry.normalized.updated", (event) => {
      normalizedEvents.push(event);
    });

    manager.register(loaded.plugin);
    expect(manager.registry.get("example.telemetry.demo")?.state).toBe("REGISTERED");

    await manager.loadAll();
    expect(manager.registry.get("example.telemetry.demo")?.state).toBe("LOADED");

    await manager.startAll();
    expect(manager.registry.get("example.telemetry.demo")?.state).toBe("STARTED");

    await bus.publish(
      createRawTelemetryEvent({
        temperatureC: "21.75",
        humidityPercent: "42.2",
        source: "simulated-sensor",
      }),
    );

    expect(normalizedEvents).toHaveLength(1);
    expect(normalizedEvents[0]).toMatchObject({
      type: "telemetry.normalized.updated",
      source: "example.telemetry.demo",
      payload: {
        source: "simulated-sensor",
        temperatureC: 21.75,
        humidityPercent: 42.2,
      },
    });

    await manager.stopAll();
    expect(manager.registry.get("example.telemetry.demo")?.state).toBe("STOPPED");

    await bus.publish(
      createRawTelemetryEvent({
        temperatureC: "19.5",
        humidityPercent: "40.0",
        source: "simulated-sensor",
      }),
    );

    expect(normalizedEvents).toHaveLength(1);
  });
});
