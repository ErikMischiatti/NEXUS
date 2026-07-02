import { describe, expect, it } from "vitest";
import {
  BasicConfigLoader,
  createDefaultConfig,
  type NexusConfig,
} from "../src/index.js";

describe("BasicConfigLoader", () => {
  it("loads the default config", async () => {
    const loader = new BasicConfigLoader();

    await expect(loader.load()).resolves.toEqual(createDefaultConfig());
  });

  it("merges partial config with defaults", () => {
    const loader = new BasicConfigLoader();

    expect(
      loader.mergeWithDefaults({
        runtime: {
          name: "custom-runtime",
        } as Partial<NexusConfig["runtime"]> as NexusConfig["runtime"],
        plugins: {
          enabled: ["alpha"],
        } as Partial<NexusConfig["plugins"]> as NexusConfig["plugins"],
      }),
    ).toEqual({
      runtime: {
        name: "custom-runtime",
        logLevel: "info",
      },
      plugins: {
        enabled: ["alpha"],
        paths: [],
      },
    });
  });

  it("validates correct config", () => {
    const loader = new BasicConfigLoader();
    const config: NexusConfig = {
      runtime: {
        name: "runtime",
        logLevel: "warn",
      },
      plugins: {
        enabled: ["alpha"],
        paths: ["./plugins"],
      },
    };

    expect(loader.validate(config)).toEqual(config);
  });

  it("rejects invalid log level", () => {
    const loader = new BasicConfigLoader();
    const config = {
      runtime: {
        name: "runtime",
        logLevel: "verbose",
      },
      plugins: {
        enabled: [],
        paths: [],
      },
    } as unknown as NexusConfig;

    expect(() => loader.validate(config)).toThrow(
      "Invalid config: runtime.logLevel must be one of debug, info, warn, error.",
    );
  });

  it("rejects invalid plugin enabled and paths fields", () => {
    const loader = new BasicConfigLoader();

    expect(() =>
      loader.validate({
        runtime: {
          name: "runtime",
          logLevel: "info",
        },
        plugins: {
          enabled: "alpha",
          paths: [],
        } as unknown as NexusConfig["plugins"],
      }),
    ).toThrow("Invalid config: plugins.enabled must be an array.");

    expect(() =>
      loader.validate({
        runtime: {
          name: "runtime",
          logLevel: "info",
        },
        plugins: {
          enabled: [],
          paths: "plugins",
        } as unknown as NexusConfig["plugins"],
      }),
    ).toThrow("Invalid config: plugins.paths must be an array.");
  });

  it("drops unknown fields rather than preserving them", () => {
    const loader = new BasicConfigLoader();

    const config = loader.mergeWithDefaults({
      runtime: {
        name: "runtime",
        logLevel: "info",
        extra: "ignored",
      } as unknown as NexusConfig["runtime"],
      plugins: {
        enabled: [],
        paths: [],
        extra: "ignored",
      } as unknown as NexusConfig["plugins"],
      extra: "ignored",
    } as unknown as Partial<NexusConfig>);

    expect(config).toEqual({
      runtime: {
        name: "runtime",
        logLevel: "info",
      },
      plugins: {
        enabled: [],
        paths: [],
      },
    });
    expect("extra" in (config as unknown as Record<string, unknown>)).toBe(false);
  });
});
