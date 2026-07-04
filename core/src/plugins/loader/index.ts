import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { validatePluginManifest } from "../manifest-validation.js";
import type { NexusPlugin, NexusPluginManifest } from "../types.js";
import type { PluginDescriptor, PluginDiscoverySource } from "../discovery/index.js";

export type PluginLoadSource = {
  descriptorPath?: string;
  entrypointPath?: string;
};

export type PluginLoadErrorCode =
  | "MISSING_DESCRIPTOR_PATH"
  | "DESCRIPTOR_READ_FAILURE"
  | "INVALID_DESCRIPTOR_JSON"
  | "MISSING_MANIFEST"
  | "INVALID_MANIFEST"
  | "MISSING_ENTRYPOINT"
  | "ENTRYPOINT_IMPORT_FAILURE"
  | "INVALID_EXPORT"
  | "MANIFEST_MISMATCH";

export type PluginLoadError = {
  code: PluginLoadErrorCode;
  message: string;
  source: PluginLoadSource;
  cause?: unknown;
};

export type PluginLoadSuccess = {
  ok: true;
  descriptor: PluginDescriptor;
  descriptorPath: string;
  entrypointPath: string;
  plugin: NexusPlugin;
};

export type PluginLoadFailure = {
  ok: false;
  error: PluginLoadError;
};

export type PluginLoadResult = PluginLoadSuccess | PluginLoadFailure;

export interface PluginLoader {
  load(descriptorOrPath: PluginDescriptor | string): Promise<PluginLoadResult>;
}

type DescriptorFile = {
  manifest?: unknown;
  path?: unknown;
  source?: unknown;
};

type PluginModule = {
  default?: unknown;
  createPlugin?: unknown;
};

type LoadableDescriptor = {
  descriptor: PluginDescriptor;
  descriptorPath: string;
};

type ErrorWithCode = Error & {
  code?: PluginLoadErrorCode;
  cause?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const toDescriptorSource = (descriptorPath?: string): PluginDiscoverySource | undefined =>
  descriptorPath ? { baseDirectory: dirname(descriptorPath), descriptorPath } : undefined;

const loadDescriptorFile = async (descriptorPath: string): Promise<DescriptorFile> => {
  let raw: string;

  try {
    raw = await readFile(descriptorPath, "utf8");
  } catch (error) {
    throw Object.assign(new Error(`Failed to read descriptor: ${descriptorPath}`), {
      code: "DESCRIPTOR_READ_FAILURE" as const,
      cause: error,
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    throw Object.assign(new Error(`Invalid JSON descriptor: ${descriptorPath}`), {
      code: "INVALID_DESCRIPTOR_JSON" as const,
      cause: error,
    });
  }

  if (!isRecord(parsed)) {
    throw Object.assign(new Error(`Invalid JSON descriptor: ${descriptorPath}`), {
      code: "INVALID_DESCRIPTOR_JSON" as const,
      cause: new Error("Descriptor JSON must be an object."),
    });
  }

  return parsed as DescriptorFile;
};

const normalizeManifest = (
  manifest: unknown,
  descriptorPath: string,
): NexusPluginManifest => {
  try {
    return validatePluginManifest(manifest);
  } catch (error) {
    if (error instanceof Error && error.name === "PluginManifestValidationError") {
      throw Object.assign(new Error(`Invalid plugin manifest in ${descriptorPath}: ${error.message}`), {
        code: "INVALID_MANIFEST" as const,
        cause: error,
      });
    }

    throw error;
  }
};

const normalizeDescriptor = async (
  descriptorOrPath: PluginDescriptor | string,
): Promise<LoadableDescriptor> => {
  if (typeof descriptorOrPath === "string") {
    const descriptorPath = descriptorOrPath;
    const file = await loadDescriptorFile(descriptorPath);

    if (!isRecord(file.manifest)) {
      throw Object.assign(new Error(`Descriptor is missing a manifest: ${descriptorPath}`), {
        code: "MISSING_MANIFEST" as const,
      });
    }

    return {
      descriptor: {
        manifest: normalizeManifest(file.manifest, descriptorPath),
        path: isString(file.path) ? file.path : descriptorPath,
        source: toDescriptorSource(descriptorPath),
      },
      descriptorPath,
    };
  }

  const descriptorPath =
    descriptorOrPath.source?.descriptorPath ?? (isString(descriptorOrPath.path) ? descriptorOrPath.path : undefined);

  if (!descriptorPath) {
    throw Object.assign(new Error("A descriptor path is required to load a plugin."), {
      code: "MISSING_DESCRIPTOR_PATH" as const,
    });
  }

  return {
    descriptor: {
      manifest: normalizeManifest(descriptorOrPath.manifest, descriptorPath),
      path: descriptorOrPath.path,
      source: descriptorOrPath.source ?? toDescriptorSource(descriptorPath),
    },
    descriptorPath,
  };
};

const loadPluginModule = async (entrypointPath: string): Promise<PluginModule> => {
  try {
    if (entrypointPath.endsWith(".cjs")) {
      const require = createRequire(import.meta.url);
      return require(entrypointPath) as PluginModule;
    }

    return (await import(pathToFileURL(entrypointPath).href)) as PluginModule;
  } catch (error) {
    throw Object.assign(new Error(`Failed to import plugin entrypoint: ${entrypointPath}`), {
      code: "ENTRYPOINT_IMPORT_FAILURE" as const,
      cause: error,
    });
  }
};

const selectPluginExport = (module: PluginModule): unknown => {
  const moduleRecord = module as Record<string, unknown>;

  if (moduleRecord.default !== undefined) {
    return moduleRecord.default;
  }

  if (isRecord(moduleRecord.manifest)) {
    return moduleRecord;
  }

  if (typeof moduleRecord.createPlugin === "function") {
    return (moduleRecord.createPlugin as () => unknown)();
  }

  throw Object.assign(new Error("Plugin module must export a default plugin or createPlugin()."), {
    code: "INVALID_EXPORT" as const,
  });
};

const normalizeLoadedPlugin = (
  plugin: unknown,
  descriptorManifest: NexusPluginManifest,
  descriptorPath: string,
): NexusPlugin => {
  if (!isRecord(plugin) || !isRecord(plugin.manifest)) {
    throw Object.assign(new Error(`Loaded plugin is missing a manifest: ${descriptorPath}`), {
      code: "INVALID_MANIFEST" as const,
    });
  }

  const loadedManifest = normalizeManifest(plugin.manifest, descriptorPath);

  if (
    loadedManifest.id !== descriptorManifest.id ||
    loadedManifest.version !== descriptorManifest.version
  ) {
    throw Object.assign(
      new Error(
        `Loaded plugin manifest mismatch for ${descriptorPath}: expected ${descriptorManifest.id}@${descriptorManifest.version}, got ${loadedManifest.id}@${loadedManifest.version}.`,
      ),
      {
        code: "MANIFEST_MISMATCH" as const,
      },
    );
  }

  const normalizedPlugin = plugin as NexusPlugin;
  normalizedPlugin.manifest = loadedManifest;
  return normalizedPlugin;
};

const toLoadError = (
  error: unknown,
  source: PluginLoadSource,
): PluginLoadError => {
  const errorWithCode = error as ErrorWithCode;

  return {
    code: errorWithCode.code ?? "ENTRYPOINT_IMPORT_FAILURE",
    message: error instanceof Error ? error.message : "Failed to load plugin.",
    source,
    cause: errorWithCode.cause ?? error,
  };
};

export class LocalPluginLoader implements PluginLoader {
  async load(descriptorOrPath: PluginDescriptor | string): Promise<PluginLoadResult> {
    let normalized: LoadableDescriptor;

    try {
      normalized = await normalizeDescriptor(descriptorOrPath);
    } catch (error) {
      const descriptorPath = typeof descriptorOrPath === "string"
        ? descriptorOrPath
        : descriptorOrPath.source?.descriptorPath ?? (isString(descriptorOrPath.path) ? descriptorOrPath.path : undefined);

      const entrypointPath =
        typeof descriptorOrPath === "string"
          ? undefined
          : descriptorPath && isString(descriptorOrPath.manifest.entrypoint)
            ? resolve(dirname(descriptorPath), descriptorOrPath.manifest.entrypoint)
            : undefined;

      return {
        ok: false,
        error: toLoadError(error, { descriptorPath, entrypointPath }),
      };
    }

    const { descriptor, descriptorPath } = normalized;
    const entrypoint = descriptor.manifest.entrypoint;

    if (!entrypoint) {
      return {
        ok: false,
        error: {
          code: "MISSING_ENTRYPOINT",
          message: `Descriptor is missing an entrypoint: ${descriptorPath}`,
          source: { descriptorPath },
        },
      };
    }

    const entrypointPath = resolve(dirname(descriptorPath), entrypoint);

    try {
      const module = await loadPluginModule(entrypointPath);
      let candidate: unknown;

      try {
        candidate = selectPluginExport(module);
      } catch (error) {
        return {
          ok: false,
          error: {
            code: (error as ErrorWithCode).code ?? "INVALID_EXPORT",
            message: error instanceof Error ? error.message : "Plugin module export is invalid.",
            source: { descriptorPath, entrypointPath },
            cause: error,
          },
        };
      }

      const plugin = normalizeLoadedPlugin(candidate, descriptor.manifest, descriptorPath);
      return {
        ok: true,
        descriptor,
        descriptorPath,
        entrypointPath,
        plugin,
      };
    } catch (error) {
      return {
        ok: false,
        error: toLoadError(error, { descriptorPath, entrypointPath }),
      };
    }
  }
}
