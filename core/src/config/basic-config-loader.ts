import type {
  ConfigLoader,
  NexusConfig,
  NexusPluginConfig,
  NexusRuntimeConfig,
} from "./types.js";

const DEFAULT_RUNTIME: NexusRuntimeConfig = {
  name: "nexus-runtime",
  logLevel: "info",
};

const DEFAULT_PLUGINS: NexusPluginConfig = {
  enabled: [],
  paths: [],
};

const DEFAULT_CONFIG: NexusConfig = {
  runtime: DEFAULT_RUNTIME,
  plugins: DEFAULT_PLUGINS,
};

export class BasicConfigLoader implements ConfigLoader {
  constructor(private readonly source: Partial<NexusConfig> = {}) {}

  async load(): Promise<NexusConfig> {
    return this.mergeWithDefaults(this.source);
  }

  mergeWithDefaults(partialConfig: Partial<NexusConfig>): NexusConfig {
    const config: NexusConfig = {
      runtime: {
        ...DEFAULT_RUNTIME,
        ...(partialConfig.runtime ?? {}),
      },
      plugins: {
        ...DEFAULT_PLUGINS,
        ...(partialConfig.plugins ?? {}),
      },
    };

    return this.validate(config);
  }

  validate(config: NexusConfig): NexusConfig {
    if (typeof config.runtime?.name !== "string" || config.runtime.name.trim() === "") {
      throw new Error("Invalid config: runtime.name is required.");
    }

    if (config.runtime.logLevel !== "debug" && config.runtime.logLevel !== "info" && config.runtime.logLevel !== "warn" && config.runtime.logLevel !== "error") {
      throw new Error(
        `Invalid config: runtime.logLevel must be one of debug, info, warn, error.`,
      );
    }

    if (!Array.isArray(config.plugins?.enabled)) {
      throw new Error("Invalid config: plugins.enabled must be an array.");
    }

    if (!Array.isArray(config.plugins?.paths)) {
      throw new Error("Invalid config: plugins.paths must be an array.");
    }

    return {
      runtime: {
        name: config.runtime.name,
        logLevel: config.runtime.logLevel,
      },
      plugins: {
        enabled: [...config.plugins.enabled],
        paths: [...config.plugins.paths],
      },
    };
  }
}

export const createDefaultConfig = (): NexusConfig => ({
  runtime: { ...DEFAULT_RUNTIME },
  plugins: { ...DEFAULT_PLUGINS },
});
