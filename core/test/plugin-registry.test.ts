import { describe, expect, it } from "vitest";
import { BasicPluginRegistry, type PluginRegistryEntry } from "../src/index.js";

const createManifest = (
  id: string,
  overrides: Partial<PluginRegistryEntry["manifest"]> = {},
) => ({
  id,
  name: id,
  version: "1.0.0",
  ...overrides,
});

describe("BasicPluginRegistry", () => {
  it("registers a plugin", () => {
    const registry = new BasicPluginRegistry();

    const entry = registry.register(createManifest("alpha"));

    expect(entry.manifest.id).toBe("alpha");
    expect(entry.state).toBe("REGISTERED");
    expect(registry.get("alpha")).toBe(entry);
    expect(registry.exists("alpha")).toBe(true);
    expect(registry.list()).toEqual([entry]);
  });

  it("rejects duplicate registration", () => {
    const registry = new BasicPluginRegistry();

    registry.register(createManifest("alpha"));

    expect(() => registry.register(createManifest("alpha"))).toThrow(
      'Plugin with id "alpha" is already registered.',
    );
  });

  it("tracks state transitions and last lifecycle errors", () => {
    const registry = new BasicPluginRegistry();
    const entry = registry.register(createManifest("alpha"));
    const error = new Error("load failed");

    registry.updateState("alpha", "LOADED");
    expect(registry.get("alpha")?.state).toBe("LOADED");

    registry.updateState("alpha", "FAILED", error);
    expect(registry.get("alpha")?.state).toBe("FAILED");
    expect(registry.get("alpha")?.lastLifecycleError).toBe(error);
    expect(entry.state).toBe("FAILED");
  });

  it("lists entries in registration order", () => {
    const registry = new BasicPluginRegistry();
    const alpha = registry.register(createManifest("alpha"));
    const beta = registry.register(createManifest("beta"));

    expect(registry.list()).toEqual([alpha, beta]);
  });

  it("filters entries by state", () => {
    const registry = new BasicPluginRegistry();
    const alpha = registry.register(createManifest("alpha"));
    const beta = registry.register(createManifest("beta"));
    const gamma = registry.register(createManifest("gamma"));

    registry.updateState("alpha", "LOADED");
    registry.updateState("beta", "FAILED", new Error("boom"));
    registry.updateState("gamma", "FAILED", new Error("boom"));

    expect(registry.listByState("LOADED")).toEqual([alpha]);
    expect(registry.listByState("FAILED")).toEqual([beta, gamma]);
  });

  it("removes entries", () => {
    const registry = new BasicPluginRegistry();

    registry.register(createManifest("alpha"));

    expect(registry.remove("alpha")).toBe(true);
    expect(registry.get("alpha")).toBeUndefined();
    expect(registry.exists("alpha")).toBe(false);
    expect(registry.list()).toEqual([]);
    expect(registry.remove("alpha")).toBe(false);
  });

  it("rejects missing plugins when updating state", () => {
    const registry = new BasicPluginRegistry();

    expect(() => registry.updateState("missing", "LOADED")).toThrow(
      'Plugin with id "missing" is not registered.',
    );
    expect(registry.get("missing")).toBeUndefined();
    expect(registry.exists("missing")).toBe(false);
    expect(registry.remove("missing")).toBe(false);
  });
});
