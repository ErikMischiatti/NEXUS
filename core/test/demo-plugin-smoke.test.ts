import { describe, expect, it } from "vitest";
import { createRuntime, type NexusEvent } from "../src/index.js";
import { createDemoPlugin } from "./fixtures/demo-plugin.js";

const createEvent = <TPayload>(
  overrides: Pick<NexusEvent<TPayload>, "id" | "type" | "source" | "timestamp" | "payload">,
): NexusEvent<TPayload> => ({
  ...overrides,
});

describe("demo plugin smoke", () => {
  it("boots runtime, routes an event through the demo plugin, and shuts down cleanly", async () => {
    const runtime = createRuntime({
      config: {
        runtime: {
          name: "demo-runtime",
          logLevel: "debug",
        },
        plugins: {
          enabled: ["demo-plugin"],
          paths: [],
        },
      },
    });

    const state = {
      received: [] as string[],
      started: false,
      stopped: false,
    };

    runtime.registerPlugin(createDemoPlugin(state));

    const outputs: Array<{ value: string }> = [];
    runtime.eventBus.subscribe("demo.output", (event) => {
      outputs.push(event.payload as { value: string });
    });

    await runtime.start();
    await runtime.eventBus.publish(
      createEvent({
        id: "demo-input-1",
        type: "demo.input",
        source: "test",
        timestamp: "2026-07-02T10:00:00.000Z",
        payload: {
          value: "hello",
        },
      }),
    );
    await runtime.stop();

    expect(state.started).toBe(true);
    expect(state.received).toEqual(["hello"]);
    expect(outputs).toEqual([{ value: "echo:hello" }]);
    expect(state.stopped).toBe(true);
  });
});
