import { randomUUID } from "node:crypto";
import type { EventSubscription, NexusPlugin } from "../../src/index.js";

type DemoPluginState = {
  received: string[];
  started: boolean;
  stopped: boolean;
  subscription?: EventSubscription;
};

export const createDemoPlugin = (
  state: DemoPluginState,
): NexusPlugin => ({
  manifest: {
    id: "demo-plugin",
    name: "demo-plugin",
    version: "1.0.0",
  },
  onStart: async ({ eventBus }) => {
    state.started = true;
    state.subscription = eventBus.subscribe<{ value: string }>("demo.input", async (event) => {
      state.received.push(event.payload.value);
      await eventBus.publish({
        id: randomUUID(),
        type: "demo.output",
        source: "demo-plugin",
        timestamp: new Date().toISOString(),
        payload: {
          value: `echo:${event.payload.value}`,
        },
      });
    });
  },
  onStop: ({ eventBus }) => {
    if (state.subscription) {
      eventBus.unsubscribe(state.subscription);
      state.subscription = undefined;
    }

    state.stopped = true;
  },
});

export type { DemoPluginState };
