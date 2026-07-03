import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  BasicPluginManager,
  InMemoryEventBus,
  LocalPluginDescriptorDiscovery,
  LocalPluginLoader,
  type PluginLoadResult,
} from "../src/index.js";

const createTempDir = async (): Promise<string> =>
  mkdtemp(join(tmpdir(), "nexus-plugin-loader-"));

const fixturePath = (name: string): string =>
  fileURLToPath(new URL(`./fixtures/loader/${name}`, import.meta.url));

const fixtureModuleUrl = (name: string): URL =>
  new URL(`./fixtures/loader/${name}`, import.meta.url);

const writeDescriptor = async (
  directory: string,
  manifest: Record<string, unknown>,
): Promise<string> => {
  await mkdir(directory, { recursive: true });
  const descriptorPath = join(directory, "nexus.plugin.json");
  await writeFile(descriptorPath, JSON.stringify({ manifest }, null, 2));
  return descriptorPath;
};

const expectLoadSuccess = (result: PluginLoadResult) => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result;
};

describe("LocalPluginLoader", () => {
  it("loads a default export plugin", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("default-export.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.default-export",
        name: "Fixture Default Export",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const loader = new LocalPluginLoader();
      const result = expectLoadSuccess(await loader.load(descriptorPath));

      expect(result.plugin.manifest).toMatchObject({
        id: "fixture.default-export",
        version: "1.0.0",
      });
      const module = await import(fixtureModuleUrl("default-export.js").href);
      expect(module.lifecycle).toEqual({ onLoad: 0, onStart: 0, onStop: 0 });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("loads a createPlugin export", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("create-plugin.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.create-plugin",
        name: "Fixture Create Plugin",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const loader = new LocalPluginLoader();
      const result = expectLoadSuccess(await loader.load(descriptorPath));

      expect(result.plugin.manifest).toMatchObject({
        id: "fixture.create-plugin",
        version: "1.0.0",
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the entrypoint is missing", async () => {
    const root = await createTempDir();

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.missing-entrypoint",
        name: "Fixture Missing Entrypoint",
        version: "1.0.0",
      });

      const loader = new LocalPluginLoader();
      const result = await loader.load(descriptorPath);

      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.error.code).toBe("MISSING_ENTRYPOINT");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the entrypoint import throws", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("throwing-entrypoint.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.throwing-entrypoint",
        name: "Fixture Throwing Entrypoint",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const loader = new LocalPluginLoader();
      const result = await loader.load(descriptorPath);

      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.error.code).toBe("ENTRYPOINT_IMPORT_FAILURE");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the module export is invalid", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("invalid-export.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.invalid-export",
        name: "Fixture Invalid Export",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const loader = new LocalPluginLoader();
      const result = await loader.load(descriptorPath);

      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.error.code).toBe("INVALID_EXPORT");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the loaded manifest mismatches the descriptor", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("mismatch-plugin.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.mismatch",
        name: "Fixture Mismatch",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const loader = new LocalPluginLoader();
      const result = await loader.load(descriptorPath);

      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.error.code).toBe("MANIFEST_MISMATCH");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the plugin manifest is invalid", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("invalid-manifest.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.invalid-manifest",
        name: "Fixture Invalid Manifest",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const loader = new LocalPluginLoader();
      const result = await loader.load(descriptorPath);

      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.error.code).toBe("INVALID_MANIFEST");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("does not call plugin lifecycle hooks during loading", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("create-plugin.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.create-plugin",
        name: "Fixture Create Plugin",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const loader = new LocalPluginLoader();
      const result = expectLoadSuccess(await loader.load(descriptorPath));
      const module = await import(fixtureModuleUrl("create-plugin.js").href);

      expect(module.lifecycle).toEqual({ onLoad: 0, onStart: 0, onStop: 0 });
      expect(result.plugin.manifest.id).toBe("fixture.create-plugin");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("supports discovery to loader to manager lifecycle", async () => {
    const root = await createTempDir();
    const pluginPath = fixturePath("create-plugin.js");

    try {
      const descriptorPath = await writeDescriptor(root, {
        id: "fixture.create-plugin",
        name: "Fixture Create Plugin",
        version: "1.0.0",
        entrypoint: relative(dirname(join(root, "nexus.plugin.json")), pluginPath),
      });

      const discovery = new LocalPluginDescriptorDiscovery();
      const discovered = await discovery.discover(root);
      expect(discovered.errors).toEqual([]);
      expect(discovered.descriptors).toHaveLength(1);
      expect(discovered.descriptors[0]?.source?.descriptorPath).toBe(descriptorPath);

      const loader = new LocalPluginLoader();
      const loaded = expectLoadSuccess(await loader.load(discovered.descriptors[0]!));
      const manager = new BasicPluginManager({ eventBus: new InMemoryEventBus() });
      const module = await import(fixtureModuleUrl("create-plugin.js").href);

      manager.register(loaded.plugin);
      await manager.loadAll();
      await manager.startAll();
      await manager.stopAll();

      expect(module.lifecycle).toEqual({ onLoad: 1, onStart: 1, onStop: 1 });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
