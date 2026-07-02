import { describe, expect, it, vi } from "vitest";
import { InMemoryEventBus, type NexusEvent } from "../src/index.js";

const createEvent = <TPayload>(
  overrides: Partial<NexusEvent<TPayload>> &
    Pick<NexusEvent<TPayload>, "id" | "type" | "source" | "timestamp" | "payload">,
): NexusEvent<TPayload> => ({
  ...overrides,
});

describe("InMemoryEventBus", () => {
  it("subscribes to an event type and publishes to the matching handler", async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();
    bus.subscribe("telemetry.updated", handler);

    const event = createEvent({
      id: "evt-1",
      type: "telemetry.updated",
      source: "core",
      timestamp: "2026-07-02T10:00:00.000Z",
      payload: { altitude: 1200 },
    });

    await bus.publish(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it("does not call handlers for different event types", async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();
    bus.subscribe("telemetry.updated", handler);

    await bus.publish(
      createEvent({
        id: "evt-2",
        type: "core.runtime.started",
        source: "core",
        timestamp: "2026-07-02T10:00:00.000Z",
        payload: {},
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it("supports unsubscribing", async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();
    const subscription = bus.subscribe("telemetry.updated", handler);

    bus.unsubscribe(subscription);

    await bus.publish(
      createEvent({
        id: "evt-3",
        type: "telemetry.updated",
        source: "core",
        timestamp: "2026-07-02T10:00:00.000Z",
        payload: {},
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it("delivers to multiple handlers for the same event type in subscription order", async () => {
    const bus = new InMemoryEventBus();
    const calls: string[] = [];

    bus.subscribe("telemetry.updated", () => {
      calls.push("first");
    });
    bus.subscribe("telemetry.updated", () => {
      calls.push("second");
    });

    await bus.publish(
      createEvent({
        id: "evt-4",
        type: "telemetry.updated",
        source: "core",
        timestamp: "2026-07-02T10:00:00.000Z",
        payload: {},
      }),
    );

    expect(calls).toEqual(["first", "second"]);
  });

  it("awaits async handlers", async () => {
    const bus = new InMemoryEventBus();
    const calls: string[] = [];

    bus.subscribe("telemetry.updated", async () => {
      calls.push("async-handler");
    });

    await expect(
      bus.publish(
        createEvent({
          id: "evt-5",
          type: "telemetry.updated",
          source: "core",
          timestamp: "2026-07-02T10:00:00.000Z",
          payload: {},
        }),
      ),
    ).resolves.toBeUndefined();

    expect(calls).toEqual(["async-handler"]);
  });

  it("fails fast when a handler throws", async () => {
    const bus = new InMemoryEventBus();
    const calls: string[] = [];

    bus.subscribe("telemetry.updated", () => {
      calls.push("first");
      throw new Error("handler failed");
    });
    bus.subscribe("telemetry.updated", () => {
      calls.push("second");
    });

    await expect(
      bus.publish(
        createEvent({
          id: "evt-6",
          type: "telemetry.updated",
          source: "core",
          timestamp: "2026-07-02T10:00:00.000Z",
          payload: {},
        }),
      ),
    ).rejects.toThrow("handler failed");

    expect(calls).toEqual(["first"]);
  });
});
