import type { LogLevel } from "../logging/types.js";

export type NexusRuntimeConfig = {
  name: string;
  logLevel: LogLevel;
};

export type NexusPluginConfig = {
  enabled: string[];
  paths: string[];
};

export type NexusConfig = {
  runtime: NexusRuntimeConfig;
  plugins: NexusPluginConfig;
};

export interface ConfigLoader {
  load(): Promise<NexusConfig>;
  mergeWithDefaults(partialConfig: Partial<NexusConfig>): NexusConfig;
  validate(config: NexusConfig): NexusConfig;
}
