import { describe, expect, it } from "vitest";
import { createRuntime } from "../src/index.js";
describe("nexus core smoke", () => {
    it("instantiates the runtime", async () => {
        const runtime = createRuntime();
        expect(runtime.name).toBe("nexus-runtime");
        await runtime.start();
        expect(runtime.state).toBe("running");
        await runtime.stop();
    });
    it("creates a runtime through the helper", async () => {
        const runtime = createRuntime("demo");
        expect(runtime.name).toBe("demo");
        await runtime.start();
        expect(runtime.config?.runtime.name).toBe("demo");
        await runtime.stop();
    });
});
