let telemetrySubscription;

const normalizeNumber = (value) => {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeTelemetryPayload = (payload = {}) => ({
  source: typeof payload.source === "string" ? payload.source : "telemetry-demo",
  temperatureC: normalizeNumber(payload.temperatureC),
  humidityPercent: normalizeNumber(payload.humidityPercent),
});

const telemetryDemoPlugin = {
  manifest: {
    id: "example.telemetry.demo",
    name: "Telemetry Demo",
    version: "1.0.0",
    description: "Middleware-independent telemetry normalization demo plugin.",
    author: "NEXUS",
    entrypoint: "./src/index.cjs",
    requiredServices: [],
    requiredCapabilities: [],
  },
  onStart: async ({ eventBus }) => {
    telemetrySubscription = eventBus.subscribe(
      "telemetry.raw.received",
      async (event) => {
        await eventBus.publish({
          id: `${event.id}:normalized`,
          type: "telemetry.normalized.updated",
          source: "example.telemetry.demo",
          timestamp: new Date().toISOString(),
          payload: normalizeTelemetryPayload(event.payload),
        });
      },
    );
  },
  onStop: ({ eventBus }) => {
    if (telemetrySubscription) {
      eventBus.unsubscribe(telemetrySubscription);
      telemetrySubscription = undefined;
    }
  },
};

module.exports = telemetryDemoPlugin;
