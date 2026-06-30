import { describe, expect, it } from "vitest";
import { Runtime, createRuntime } from "../src/index.js";

describe("nexus core smoke", () => {
  it("instantiates the placeholder runtime", () => {
    const runtime = new Runtime();
    expect(runtime.name).toBe("nexus-core");
    expect(runtime.start()).toBe("nexus-core:started");
  });

  it("creates a runtime through the helper", () => {
    const runtime = createRuntime("demo");
    expect(runtime.name).toBe("demo");
    expect(runtime.start()).toBe("demo:started");
  });
});
