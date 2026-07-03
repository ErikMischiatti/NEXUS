import type { NexusPluginCompatibility, NexusPluginManifest } from "./types.js";

export class PluginManifestValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "PluginManifestValidationError";
  }
}

type UnknownRecord = Record<string, unknown>;

const isObject = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new PluginManifestValidationError(`${field} must be a string.`, field);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new PluginManifestValidationError(`${field} must not be empty.`, field);
  }

  return normalized;
};

const normalizeOptionalString = (
  value: unknown,
  field: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return normalizeString(value, field);
};

const normalizeStringArray = (value: unknown, field: string): string[] => {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new PluginManifestValidationError(`${field} must be an array of strings.`, field);
  }

  return value.map((entry, index) => {
    if (typeof entry !== "string") {
      throw new PluginManifestValidationError(
        `${field}[${index}] must be a string.`,
        field,
      );
    }

    const normalized = entry.trim();
    if (!normalized) {
      throw new PluginManifestValidationError(
        `${field}[${index}] must not be empty.`,
        field,
      );
    }

    return normalized;
  });
};

const normalizeCompatibility = (
  value: unknown,
): NexusPluginCompatibility | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!isObject(value)) {
    throw new PluginManifestValidationError(
      "compatibility must be an object when present.",
      "compatibility",
    );
  }

  const nexusCore = normalizeOptionalString(value.nexusCore, "compatibility.nexusCore");
  const pluginApi = normalizeOptionalString(value.pluginApi, "compatibility.pluginApi");

  if (nexusCore === undefined && pluginApi === undefined) {
    return {};
  }

  return {
    ...(nexusCore !== undefined ? { nexusCore } : {}),
    ...(pluginApi !== undefined ? { pluginApi } : {}),
  };
};

export const validatePluginManifest = (
  input: unknown,
): NexusPluginManifest => {
  if (!isObject(input)) {
    throw new PluginManifestValidationError("Plugin manifest must be an object.");
  }

  const manifest = {
    id: normalizeString(input.id, "id"),
    name: normalizeString(input.name, "name"),
    version: normalizeString(input.version, "version"),
    ...(input.description !== undefined
      ? { description: normalizeOptionalString(input.description, "description") }
      : {}),
    ...(input.author !== undefined
      ? { author: normalizeOptionalString(input.author, "author") }
      : {}),
    ...(input.entrypoint !== undefined
      ? { entrypoint: normalizeOptionalString(input.entrypoint, "entrypoint") }
      : {}),
    requiredServices: normalizeStringArray(input.requiredServices, "requiredServices"),
    requiredCapabilities: normalizeStringArray(
      input.requiredCapabilities,
      "requiredCapabilities",
    ),
    ...(input.compatibility !== undefined
      ? { compatibility: normalizeCompatibility(input.compatibility) }
      : {}),
  } satisfies NexusPluginManifest;

  return manifest;
};
