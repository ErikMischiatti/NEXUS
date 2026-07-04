# Telemetry Demo Plugin

This is a minimal middleware-independent NEXUS example plugin.

## Descriptor

- `nexus.plugin.json` declares the plugin manifest used by discovery, validation, and registration.
- The descriptor points to `./src/index.cjs` as the loader entrypoint.

## Entrypoint

- `src/index.cjs` exports a default plugin object via CommonJS `module.exports`.
- The plugin is plain JavaScript so the loader can import it directly without a build step.

## Events Consumed

- `telemetry.raw.received`

## Events Published

- `telemetry.normalized.updated`

## Why It Is Middleware-Independent

- It uses only the public `eventBus` from plugin context.
- It does not import ROS, MQTT, MAVLink, or any vehicle-specific adapter.
- It only normalizes telemetry payload values and republishes them as a generic event.

## Lifecycle

- `onStart` subscribes to raw telemetry events.
- `onStop` unsubscribes cleanly.
- The loader imports the plugin entrypoint, but lifecycle execution remains the plugin manager's responsibility.
