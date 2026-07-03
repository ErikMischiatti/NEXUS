import { describe, expect, it } from "vitest";
import {
  PluginManifestValidationError,
  validatePluginManifest,
  type NexusPluginManifest,
} from "../src/index.js";

describe("validatePluginManifest", () => {
  it("accepts and normalizes a valid manifest", () => {
    const manifest = validatePluginManifest({
      id: "  plugin.alpha  ",
      name: "  Alpha Plugin ",
      version: " 1.0.0 ",
      description: "  Example plugin ",
      author: " NEXUS ",
      entrypoint: " ./dist/index.js ",
      requiredServices: [" eventBus ", " config "],
      requiredCapabilities: [" telemetry "],
      compatibility: {
        nexusCore: " ^2.1.0 ",
        pluginApi: " ^1.0.0 ",
        extra: "drop me",
      },
      extra: "dropped",
    } as unknown as Record<string, unknown>);

    expect(manifest).toEqual({
      id: "plugin.alpha",
      name: "Alpha Plugin",
      version: "1.0.0",
      description: "Example plugin",
      author: "NEXUS",
      entrypoint: "./dist/index.js",
      requiredServices: ["eventBus", "config"],
      requiredCapabilities: ["telemetry"],
      compatibility: {
        nexusCore: "^2.1.0",
        pluginApi: "^1.0.0",
      },
    } satisfies NexusPluginManifest);
  });

  it("defaults required service arrays to empty arrays", () => {
    const manifest = validatePluginManifest({
      id: "plugin.beta",
      name: "Plugin Beta",
      version: "1.0.0",
    });

    expect(manifest.requiredServices).toEqual([]);
    expect(manifest.requiredCapabilities).toEqual([]);
  });

  it.each([
    ["id", { name: "Plugin", version: "1.0.0" }],
    ["name", { id: "plugin", version: "1.0.0" }],
    ["version", { id: "plugin", name: "Plugin" }],
  ])("rejects missing required field %s", (field, manifest) => {
    expect(() => validatePluginManifest(manifest)).toThrow(
      PluginManifestValidationError,
    );
    expect(() => validatePluginManifest(manifest)).toThrow(field);
  });

  it.each([
    ["id", { id: " ", name: "Plugin", version: "1.0.0" }],
    ["name", { id: "plugin", name: " ", version: "1.0.0" }],
    ["version", { id: "plugin", name: "Plugin", version: " " }],
  ])("rejects empty %s", (field, manifest) => {
    expect(() => validatePluginManifest(manifest)).toThrow(
      PluginManifestValidationError,
    );
    expect(() => validatePluginManifest(manifest)).toThrow(field);
  });

  it("validates optional string fields", () => {
    const manifest = validatePluginManifest({
      id: "plugin.gamma",
      name: "Plugin Gamma",
      version: "1.0.0",
      description: "  Description ",
      author: " Author ",
      entrypoint: " ./dist/plugin.js ",
    });

    expect(manifest.description).toBe("Description");
    expect(manifest.author).toBe("Author");
    expect(manifest.entrypoint).toBe("./dist/plugin.js");
  });

  it("rejects invalid requiredServices values", () => {
    expect(() =>
      validatePluginManifest({
        id: "plugin.delta",
        name: "Plugin Delta",
        version: "1.0.0",
        requiredServices: "eventBus",
      }),
    ).toThrow(PluginManifestValidationError);
  });

  it("rejects invalid requiredCapabilities values", () => {
    expect(() =>
      validatePluginManifest({
        id: "plugin.epsilon",
        name: "Plugin Epsilon",
        version: "1.0.0",
        requiredCapabilities: [1],
      }),
    ).toThrow(PluginManifestValidationError);
  });

  it("rejects invalid compatibility values", () => {
    expect(() =>
      validatePluginManifest({
        id: "plugin.zeta",
        name: "Plugin Zeta",
        version: "1.0.0",
        compatibility: "not-an-object",
      }),
    ).toThrow(PluginManifestValidationError);
  });

  it("drops unknown manifest fields", () => {
    const manifest = validatePluginManifest({
      id: "plugin.eta",
      name: "Plugin Eta",
      version: "1.0.0",
      unknownField: "ignored",
    } as Record<string, unknown>);

    expect(manifest).not.toHaveProperty("unknownField");
  });
});
