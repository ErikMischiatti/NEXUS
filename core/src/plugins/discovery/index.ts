import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { validatePluginManifest } from "../manifest-validation.js";
import type { NexusPluginManifest } from "../types.js";
import type { PluginRegistry, PluginRegistryEntry } from "../registry/index.js";

export type PluginDiscoverySource = {
  baseDirectory: string;
  descriptorPath?: string;
};

export type PluginDescriptor = {
  manifest: NexusPluginManifest;
  path?: string;
  source?: PluginDiscoverySource;
};

export type PluginDiscoveryErrorCode =
  | "BASE_DIRECTORY_NOT_FOUND"
  | "BASE_PATH_NOT_DIRECTORY"
  | "UNREADABLE_DESCRIPTOR"
  | "INVALID_JSON"
  | "MISSING_MANIFEST"
  | "INVALID_MANIFEST";

export type PluginDiscoveryError = {
  code: PluginDiscoveryErrorCode;
  message: string;
  source: PluginDiscoverySource;
  cause?: unknown;
};

export type PluginDiscoveryResult = {
  descriptors: PluginDescriptor[];
  errors: PluginDiscoveryError[];
};

type DescriptorPayload = {
  manifest?: unknown;
  path?: unknown;
  source?: unknown;
};

type FsError = NodeJS.ErrnoException & {
  code?: string;
};

const DEFAULT_DESCRIPTOR_FILE = "nexus.plugin.json";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeBaseDirectories = (baseDirectories: readonly string[] | string): string[] =>
  (Array.isArray(baseDirectories) ? baseDirectories : [baseDirectories])
    .map((directory) => directory.trim())
    .filter((directory) => directory.length > 0);

const collectDescriptorPaths = async (
  baseDirectory: string,
  descriptorFileName: string,
): Promise<string[]> => {
  const entries = await readdir(baseDirectory, { withFileTypes: true });
  const childDescriptorPaths: string[] = [];
  let rootDescriptorPath: string | undefined;

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isFile() && entry.name === descriptorFileName) {
      rootDescriptorPath = join(baseDirectory, descriptorFileName);
      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    const childDirectory = join(baseDirectory, entry.name);
    const childEntries = await readdir(childDirectory, { withFileTypes: true });
    if (childEntries.some((childEntry) => childEntry.isFile() && childEntry.name === descriptorFileName)) {
      childDescriptorPaths.push(join(childDirectory, descriptorFileName));
    }
  }

  return [
    ...(rootDescriptorPath ? [rootDescriptorPath] : []),
    ...childDescriptorPaths.sort((left, right) => left.localeCompare(right)),
  ];
};

const parseDescriptor = (raw: string): DescriptorPayload => {
  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Descriptor JSON must be an object.");
  }

  return parsed as DescriptorPayload;
};

export class LocalPluginDescriptorDiscovery {
  constructor(private readonly descriptorFileName = DEFAULT_DESCRIPTOR_FILE) {}

  async discover(baseDirectories: readonly string[] | string): Promise<PluginDiscoveryResult> {
    const descriptors: PluginDescriptor[] = [];
    const errors: PluginDiscoveryError[] = [];

    for (const baseDirectory of normalizeBaseDirectories(baseDirectories)) {
      let descriptorPaths: string[];

      try {
        descriptorPaths = await collectDescriptorPaths(baseDirectory, this.descriptorFileName);
      } catch (error) {
        const fsError = error as FsError;
        const notFound = fsError.code === "ENOENT";

        errors.push({
          code: notFound ? "BASE_DIRECTORY_NOT_FOUND" : "BASE_PATH_NOT_DIRECTORY",
          message: notFound
            ? `Base directory not found: ${baseDirectory}`
            : `Base path is not a directory or cannot be read: ${baseDirectory}`,
          source: { baseDirectory },
          cause: error,
        });
        continue;
      }

      for (const descriptorPath of descriptorPaths) {
        try {
          const raw = await readFile(descriptorPath, "utf8");
          const payload = parseDescriptor(raw);

          if (!isRecord(payload.manifest)) {
            errors.push({
              code: "MISSING_MANIFEST",
              message: `Descriptor is missing a manifest: ${descriptorPath}`,
              source: { baseDirectory, descriptorPath },
            });
            continue;
          }

          const manifest = validatePluginManifest(payload.manifest);
          descriptors.push({
            manifest,
            path: typeof payload.path === "string" ? payload.path : descriptorPath,
            source: {
              baseDirectory,
              descriptorPath,
            },
          });
        } catch (error) {
          if (error instanceof SyntaxError) {
            errors.push({
              code: "INVALID_JSON",
              message: `Invalid JSON descriptor: ${descriptorPath}`,
              source: { baseDirectory, descriptorPath },
              cause: error,
            });
            continue;
          }

          if (error instanceof Error && error.name === "PluginManifestValidationError") {
            errors.push({
              code: "INVALID_MANIFEST",
              message: error.message,
              source: { baseDirectory, descriptorPath },
              cause: error,
            });
            continue;
          }

          errors.push({
            code: "UNREADABLE_DESCRIPTOR",
            message: `Failed to read descriptor: ${descriptorPath}`,
            source: { baseDirectory, descriptorPath },
            cause: error,
          });
        }
      }
    }
 

    errors.sort((left, right) => {
      const leftPath = left.source.descriptorPath ?? left.source.baseDirectory;
      const rightPath = right.source.descriptorPath ?? right.source.baseDirectory;
      return leftPath.localeCompare(rightPath) || left.code.localeCompare(right.code);
    });

    return { descriptors, errors };
  }
}

export const registerDiscoveredDescriptors = (
  registry: PluginRegistry,
  result: PluginDiscoveryResult,
): PluginRegistryEntry[] => result.descriptors.map((descriptor) => registry.register(descriptor.manifest));
