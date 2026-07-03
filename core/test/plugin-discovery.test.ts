import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  BasicPluginRegistry,
  LocalPluginDescriptorDiscovery,
  registerDiscoveredDescriptors,
} from "../src/index.js";

const createTempDir = async (): Promise<string> =>
  mkdtemp(join(tmpdir(), "nexus-plugin-discovery-"));

const writeDescriptor = async (
  directory: string,
  value: unknown,
  fileName = "nexus.plugin.json",
): Promise<string> => {
  await mkdir(directory, { recursive: true });
  const descriptorPath = join(directory, fileName);
  await writeFile(descriptorPath, JSON.stringify(value, null, 2));
  return descriptorPath;
};

describe("LocalPluginDescriptorDiscovery", () => {
  it("discovers a valid descriptor", async () => {
    const root = await createTempDir();

    try {
      const descriptorPath = await writeDescriptor(root, {
        manifest: {
          id: "example.alpha",
          name: "Example Alpha",
          version: "1.0.0",
        },
      });

      const discovery = new LocalPluginDescriptorDiscovery();
      const result = await discovery.discover(root);

      expect(result.errors).toEqual([]);
      expect(result.descriptors).toHaveLength(1);
      expect(result.descriptors[0]).toMatchObject({
        manifest: {
          id: "example.alpha",
          name: "Example Alpha",
          version: "1.0.0",
          requiredServices: [],
          requiredCapabilities: [],
        },
        path: descriptorPath,
        source: {
          baseDirectory: root,
          descriptorPath,
        },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("reports invalid JSON descriptors", async () => {
    const root = await createTempDir();

    try {
      await mkdir(root, { recursive: true });
      await writeFile(join(root, "nexus.plugin.json"), "{ invalid json");

      const discovery = new LocalPluginDescriptorDiscovery();
      const result = await discovery.discover(root);

      expect(result.descriptors).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        code: "INVALID_JSON",
        source: {
          baseDirectory: root,
          descriptorPath: join(root, "nexus.plugin.json"),
        },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("reports descriptors missing a manifest", async () => {
    const root = await createTempDir();

    try {
      const descriptorPath = await writeDescriptor(root, {
        path: "./dist/index.js",
      });

      const discovery = new LocalPluginDescriptorDiscovery();
      const result = await discovery.discover(root);

      expect(result.descriptors).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        code: "MISSING_MANIFEST",
        source: {
          baseDirectory: root,
          descriptorPath,
        },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("reports invalid manifest fields", async () => {
    const root = await createTempDir();

    try {
      const descriptorPath = await writeDescriptor(root, {
        manifest: {
          id: "bad.plugin",
          name: " ",
          version: "1.0.0",
        },
      });

      const discovery = new LocalPluginDescriptorDiscovery();
      const result = await discovery.discover(root);

      expect(result.descriptors).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        code: "INVALID_MANIFEST",
        source: {
          baseDirectory: root,
          descriptorPath,
        },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("discovers multiple descriptors deterministically and only one level below", async () => {
    const root = await createTempDir();

    try {
      const rootDescriptor = await writeDescriptor(root, {
        manifest: {
          id: "root.plugin",
          name: "Root Plugin",
          version: "1.0.0",
        },
      });
      const betaDescriptor = await writeDescriptor(join(root, "beta"), {
        manifest: {
          id: "beta.plugin",
          name: "Beta Plugin",
          version: "1.0.0",
        },
      });
      await writeDescriptor(join(root, "alpha", "deeper"), {
        manifest: {
          id: "ignored.plugin",
          name: "Ignored Plugin",
          version: "1.0.0",
        },
      });
      const alphaDescriptor = await writeDescriptor(join(root, "alpha"), {
        manifest: {
          id: "alpha.plugin",
          name: "Alpha Plugin",
          version: "1.0.0",
        },
      });

      const discovery = new LocalPluginDescriptorDiscovery();
      const first = await discovery.discover(root);
      const second = await discovery.discover(root);

      expect(first).toEqual(second);
      expect(first.descriptors.map((descriptor) => descriptor.manifest.id)).toEqual([
        "root.plugin",
        "alpha.plugin",
        "beta.plugin",
      ]);
      expect(first.descriptors.map((descriptor) => descriptor.source?.descriptorPath)).toEqual([
        rootDescriptor,
        alphaDescriptor,
        betaDescriptor,
      ]);
      expect(first.descriptors.some((descriptor) => descriptor.manifest.id === "ignored.plugin")).toBe(false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("does not execute entrypoints during discovery", async () => {
    const root = await createTempDir();

    try {
      const entrypointPath = join(root, "dist", "index.js");
      await mkdir(join(root, "dist"), { recursive: true });
      await writeFile(entrypointPath, "throw new Error('entrypoint should not execute');\n");
      await writeDescriptor(root, {
        manifest: {
          id: "safe.plugin",
          name: "Safe Plugin",
          version: "1.0.0",
          entrypoint: "./dist/index.js",
        },
      });

      const discovery = new LocalPluginDescriptorDiscovery();
      const result = await discovery.discover(root);

      expect(result.errors).toEqual([]);
      expect(result.descriptors).toHaveLength(1);
      expect(result.descriptors[0]?.manifest.entrypoint).toBe("./dist/index.js");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("registers only valid discovered descriptors into the registry", async () => {
    const root = await createTempDir();

    try {
      await writeDescriptor(root, {
        manifest: {
          id: "valid.plugin",
          name: "Valid Plugin",
          version: "1.0.0",
        },
      });
      await writeDescriptor(join(root, "invalid"), {
        path: "./dist/index.js",
      });

      const discovery = new LocalPluginDescriptorDiscovery();
      const result = await discovery.discover(root);
      const registry = new BasicPluginRegistry();

      const entries = registerDiscoveredDescriptors(registry, result);

      expect(result.errors).toHaveLength(1);
      expect(entries).toHaveLength(1);
      expect(entries[0]?.manifest.id).toBe("valid.plugin");
      expect(registry.list().map((entry) => entry.manifest.id)).toEqual(["valid.plugin"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
