# NEXUS Event Bus Guide

## 1. Purpose of This Document

This document explains the NEXUS Event Bus in depth.

The goal is to understand:

- what an Event Bus is
- why NEXUS uses one
- how events are represented
- how publish/subscribe works
- how the current in-memory implementation behaves
- how plugins use the Event Bus
- how runtime lifecycle events fit into the same model

This is a learning guide, not a specification for future messaging infrastructure.

## 2. What Is an Event Bus?

### 2.1 Simple Definition

An Event Bus is a shared communication mechanism where one part of a system publishes events and other parts subscribe to them.

Instead of calling each other directly, components send messages through the bus.

### 2.2 Generic Example

In a generic application:

- a sensor module publishes `temperature.changed`
- a dashboard subscribes to that event and updates the display
- a logger subscribes to record the change

The publisher does not need to know who is listening.

### 2.3 Event Bus in NEXUS

In NEXUS, the Event Bus is the core in-process communication layer used by:

- the runtime
- plugins
- future adapter integrations

The current implementation is `InMemoryEventBus` in `core/src/bus/in-memory-event-bus.ts`.

It is used for:

- runtime lifecycle events such as `core.runtime.started`
- plugin lifecycle communication
- plugin-to-plugin communication through shared event types

The Event Bus is not the same thing as the UI `RuntimeSnapshot`. The bus is live communication; the snapshot is a UI-facing state model.

## 3. Why NEXUS Needs an Event Bus

NEXUS needs an Event Bus because the platform is designed to be decoupled.

The Event Bus solves several problems:

- plugins should not depend directly on each other
- the runtime should be able to publish lifecycle changes without hard-coding listeners
- future adapters should be able to translate external system data into normalized internal events
- event-driven behavior is easier to compose than direct cross-module calls

Without an Event Bus, NEXUS would tend toward:

- tight coupling between modules
- direct imports across boundaries
- hidden dependencies
- harder testing
- less flexible future integration

The Event Bus gives NEXUS a clean runtime communication boundary.

## 4. Event-Driven Architecture

### 4.1 Simple Definition

Event-driven architecture is a style where system behavior is organized around events.

Something happens, an event is emitted, and interested parts of the system react.

### 4.2 Why It Helps Robotics Operations

Robotics systems produce lots of changing state:

- telemetry
- connection changes
- alerts
- mode transitions
- task updates

Event-driven architecture helps because:

- many parts of the system can react to the same signal
- new consumers can be added without changing the producer
- telemetry and lifecycle changes can be represented consistently

### 4.3 How NEXUS Uses the Pattern

NEXUS uses event-driven architecture in the core runtime and plugin platform.

The current Event Bus is:

- in-process
- in-memory
- async
- sequential
- minimal

That makes it a small event-driven foundation rather than a full distributed message platform.

## 5. Event Model

### 5.1 NexusEvent

The core event type is:

```ts
export type NexusEvent<TPayload = unknown> = {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payload: TPayload;
  correlationId?: string;
};
```

This is the event envelope.

The bus transports the envelope. It does not interpret the payload semantics.

### 5.2 id

**Simple definition:** A unique identifier for the event.

**In NEXUS:** Each event has its own `id`, such as `evt-001` in mock UI data or a UUID in runtime lifecycle events.

**Why it helps:** It makes events traceable and easy to correlate in logs or tests.

**Code reference:** `core/src/bus/types.ts`, `core/src/runtime/basic-runtime.ts`

### 5.3 type

**Simple definition:** The event category or name.

**In NEXUS:** Event types are strings like `core.runtime.started`, `telemetry.raw.received`, or `telemetry.normalized.updated`.

**Why it helps:** Subscribers can listen only for the kinds of events they care about.

**Code reference:** `core/src/bus/types.ts`

This `type` is a runtime event name string, not a TypeScript type.

### 5.4 source

**Simple definition:** The component that emitted the event.

**In NEXUS:** Sources include `"core.runtime"` and plugin identifiers like `"example.telemetry.demo"`.

**Why it helps:** Consumers can tell where an event came from.

**Code reference:** `core/src/bus/types.ts`, `core/src/runtime/basic-runtime.ts`, `examples/plugins/telemetry-demo/src/index.cjs`

### 5.5 timestamp

**Simple definition:** When the event was created.

**In NEXUS:** It is stored as an ISO string.

**Why it helps:** It supports ordering, debugging, and event stream display.

**Code reference:** `core/src/bus/types.ts`, `core/src/runtime/basic-runtime.ts`

### 5.6 payload

**Simple definition:** The event-specific data.

**In NEXUS:** Payloads can contain runtime names, telemetry values, or any other event-specific structure.

**Why it helps:** Different event types can carry different shapes without changing the bus interface.

**Code reference:** `core/src/bus/types.ts`

The bus itself does not interpret the payload. It only transports it.

### 5.7 correlationId

**Simple definition:** An optional identifier for linking related events.

**In NEXUS:** The field exists in the core event type for future traceability and request-chain style linking.

**Why it helps:** It can connect a chain of related events later.

**Code reference:** `core/src/bus/types.ts`

## 6. Event Bus API

### 6.1 EventBus Interface

The interface is:

```ts
export interface EventBus {
  publish<TPayload>(event: NexusEvent<TPayload>): Promise<void>;
  subscribe<TPayload>(
    type: string,
    handler: EventHandler<TPayload>,
  ): EventSubscription;
  unsubscribe(subscription: EventSubscription): void;
}
```

### 6.2 publish()

`publish()` sends an event to all subscribers of that event type.

Why it returns `Promise<void>`:

- handlers may be asynchronous
- the bus waits for all handlers in order
- publish should resolve only when dispatch is done

### 6.3 subscribe()

`subscribe()` registers a handler for one event type.

It returns a lightweight `EventSubscription` token.

### 6.4 unsubscribe()

`unsubscribe()` removes a previous subscription.

It takes the token returned by `subscribe()`.

### 6.5 EventHandler

`EventHandler<TPayload>` is the function that handles an event.

It can return:

- `void`
- `Promise<void>`

That means a handler can be synchronous or asynchronous.

### 6.6 EventSubscription

`EventSubscription` is the token used to unsubscribe later.

It contains:

- an `id`
- the event `type`

It is not the handler itself.

## 7. InMemoryEventBus Overview

### 7.1 What It Is

`InMemoryEventBus` is the current concrete Event Bus implementation.

It lives in `core/src/bus/in-memory-event-bus.ts`.

### 7.2 Why It Is In-Memory

It is in-memory because NEXUS currently uses a simple in-process runtime model.

Benefits:

- simple
- deterministic
- fast
- easy to test

Tradeoff:

- events do not survive process restart
- it does not behave like a network broker

### 7.3 What It Stores Internally

The bus stores subscriptions in a map:

```ts
private readonly subscriptionsByType = new Map<string, SubscriptionRecord[]>();
```

Why this shape is useful:

- string keys group subscriptions by event type
- array values preserve subscription order
- lookup by event type is direct

### 7.4 How Subscription IDs Work

The bus uses:

```ts
private nextSubscriptionId = 0;
```

Each call to `subscribe()` increments the counter and creates ids such as:

- `sub-1`
- `sub-2`
- `sub-3`

Why this helps:

- subscription tokens are simple and local
- tests can reason about subscription identity

These ids are deterministic inside the process, but they are not globally meaningful outside it.

### 7.5 How Events Are Dispatched

`publish()`:

- reads `event.type`
- finds matching subscriptions
- returns early if none exist
- copies the subscription array
- invokes handlers in order
- awaits each handler before continuing

### 7.6 How Unsubscribe Works

`unsubscribe()`:

- finds the subscription list by `subscription.type`
- filters out the matching `subscription.id`
- deletes the map entry if no subscriptions remain
- stores the updated list otherwise

## 8. Publish Flow

```text
publish(event)
        ↓
read event.type
        ↓
find subscriptions for that type
        ↓
if none, return
        ↓
copy subscriptions array
        ↓
for each subscription in order
        ↓
await handler(event)
        ↓
if all handlers complete, publish resolves
```

Why the copy matters:

- it avoids iteration problems if the subscription list changes during dispatch

Why the method is async:

- the bus needs to wait for all handler work to finish

## 9. Subscribe Flow

```text
subscribe(type, handler)
        ↓
create subscription record
        ↓
assign id such as sub-1
        ↓
find existing list for type
        ↓
append record or create new list
        ↓
return lightweight EventSubscription token
```

Why the bus groups subscriptions by type:

- publish can find interested handlers quickly
- the implementation stays simple and readable

## 10. Unsubscribe Flow

```text
unsubscribe(subscription)
        ↓
find subscription list by subscription.type
        ↓
filter out matching subscription.id
        ↓
if list becomes empty, delete map entry
        ↓
otherwise store updated list
```

Why delete the map entry when the list becomes empty:

- it keeps the internal data structure tidy
- it avoids holding empty arrays for no reason

## 11. Async Sequential Dispatch

The current bus dispatches handlers sequentially.

That means:

1. handler A runs
2. the bus waits for handler A to finish
3. handler B runs
4. the bus waits for handler B to finish
5. and so on

Why this matters:

- execution order is deterministic
- test behavior is easier to predict
- failures are easier to attribute to a specific handler

Tradeoff:

- it is slower than parallel dispatch
- one slow handler blocks later handlers

## 12. Error Handling Behavior

Current behavior:

- if a handler throws or rejects, `publish()` rejects
- later handlers for that event are not invoked
- the bus fails fast instead of isolating the error

This is intentionally simple.

What is not implemented yet:

- retries
- dead-letter queues
- error isolation
- event persistence
- parallel dispatch
- backpressure

Tradeoff:

- simpler and more deterministic
- easier to test
- but not production-grade event processing

## 13. Event Bus in the Runtime Startup Flow

`BasicRuntime` uses the Event Bus as part of startup:

- it creates an `InMemoryEventBus`
- it exposes the bus through the runtime handle
- it registers the bus in the service container
- it passes the bus into `PluginContext`
- it publishes `core.runtime.started`
- it publishes `core.runtime.stopped`

Why this matters:

- plugins can communicate without directly depending on each other
- runtime lifecycle can be observed through events
- future adapters can publish normalized events
- future UI bindings may derive state from event streams

## 14. Event Bus in Plugin Lifecycle

The runtime gives plugins access to the bus through `PluginContext`.

That means plugins can:

- subscribe to event types
- publish new events
- unsubscribe during cleanup

The plugin manager runs lifecycle hooks in a controlled sequence:

- `onLoad`
- `onStart`
- `onStop`

The Event Bus is the shared communication channel that makes this lifecycle useful.

## 15. Telemetry Demo Plugin Example

The example telemetry plugin demonstrates middleware-independent event normalization.

Its flow is:

```text
telemetry.raw.received
        ↓
Telemetry Demo plugin handler
        ↓
normalize payload
        ↓
telemetry.normalized.updated
```

How it works in `examples/plugins/telemetry-demo/src/index.cjs`:

- `onStart` subscribes to `telemetry.raw.received`
- the handler normalizes the payload
- the handler publishes `telemetry.normalized.updated`
- `onStop` unsubscribes

Why this matters:

- the plugin does not care whether telemetry came from ROS, MQTT, MAVLink, or a simulator
- it only deals with normalized event data

Important distinction:

- this runtime plugin example is not the same thing as the UI Telemetry Demo React view
- the UI view is a browser component
- the runtime plugin is a core lifecycle participant

## 16. TypeScript Syntax Explained

### 16.1 Generic Event Types

```ts
type NexusEvent<TPayload = unknown>
```

This means:

- `TPayload` is a generic type parameter
- `= unknown` gives it a default type
- `unknown` means the bus does not assume a payload shape

Why this is useful:

- callers can type their payloads when they know the shape
- the bus stays generic

### 16.2 Function Types

```ts
type EventHandler<TPayload = unknown> = (
  event: NexusEvent<TPayload>,
) => void | Promise<void>;
```

This means:

- `EventHandler` is a function type
- the function receives a typed event
- the function may return `void` or `Promise<void>`

Why this is useful:

- handlers can be synchronous or asynchronous

### 16.3 Interfaces

`EventBus` is an interface.

An interface describes the shape of an object without forcing a specific implementation.

### 16.4 Type Aliases

`NexusEvent`, `EventHandler`, and `EventSubscription` are type aliases.

They give names to reusable type shapes.

### 16.5 Maps

```ts
private readonly subscriptionsByType = new Map<string, SubscriptionRecord[]>();
```

This means:

- `private` hides the field from outside callers
- `readonly` prevents reassignment of the map reference
- `Map` stores key/value pairs
- keys are event type strings
- values are arrays of subscriptions

### 16.6 Arrays and Spread Syntax

```ts
for (const subscription of [...subscriptions]) {
  await subscription.handler(event);
}
```

This means:

- `[...subscriptions]` creates a copy of the array
- `for...of` loops over each item in order
- `await` waits for each handler to finish

Why the copy matters:

- it avoids problems if subscriptions change during publish

### 16.7 Async/Await

`publish()` is async because handlers may be async.

The bus waits for each handler to complete before moving to the next one.

### 16.8 Type Assertions

```ts
handler: handler as EventHandler<unknown>
```

This is a type assertion.

Why it is used:

- the bus stores handlers in a generic internal structure
- the bus does not preserve each caller's exact payload type internally

Tradeoff:

- the internal storage becomes less specific
- but the public API remains generic and usable

### 16.9 Optional Payload Typing

`NexusEvent<TPayload = unknown>` means payload typing is optional.

Callers can supply a specific payload type when useful, but the bus itself remains payload-agnostic.

### 16.10 Readonly Class Fields

`readonly` class fields are used for internal storage that should not be replaced.

That keeps the bus implementation stable after construction.

## 17. Design Patterns Used

### Publish/Subscribe Pattern

Simple definition:

- one side publishes messages
- other sides subscribe to them

Where it appears in NEXUS:

- `publish()`, `subscribe()`, and `unsubscribe()` in `EventBus`

Why it helps:

- decouples producers and consumers

Tradeoff:

- control flow is less direct than a function call

### Event-Driven Architecture

Simple definition:

- system behavior is organized around events

Where it appears in NEXUS:

- runtime lifecycle events
- plugin communication

Why it helps:

- fits changing robotics data well

Tradeoff:

- debugging can be harder if event flows become too large

### Observer Pattern

Simple definition:

- observers react when something they observe changes

Where it appears in NEXUS:

- event handlers observing event types

Why it helps:

- multiple handlers can react to the same event

Tradeoff:

- implicit behavior can become harder to trace if overused

### Message Envelope

Simple definition:

- a standard wrapper around message data

Where it appears in NEXUS:

- `NexusEvent`

Why it helps:

- gives every event shared metadata fields

Tradeoff:

- the envelope adds structure around simple messages

### In-Memory Broker

Simple definition:

- a broker-like message dispatcher that lives in process memory

Where it appears in NEXUS:

- `InMemoryEventBus`

Why it helps:

- simple and fast for early-stage development

Tradeoff:

- no persistence or distributed delivery

### Sequential Dispatcher

Simple definition:

- handlers are processed one at a time in order

Where it appears in NEXUS:

- `publish()` in `InMemoryEventBus`

Why it helps:

- deterministic behavior

Tradeoff:

- slower than parallel dispatch

### Fail-Fast Error Propagation

Simple definition:

- stop immediately when a handler fails

Where it appears in NEXUS:

- `publish()` rejects on handler error

Why it helps:

- errors are visible immediately

Tradeoff:

- one failing handler stops later handlers

### Decoupling Through Interfaces

Simple definition:

- use abstractions instead of hard-coded dependencies

Where it appears in NEXUS:

- `EventBus`
- `EventHandler`
- `EventSubscription`

Why it helps:

- easier to swap implementations later

Tradeoff:

- slightly more abstraction up front

### Runtime Communication Boundary

Simple definition:

- a controlled place where runtime modules exchange messages

Where it appears in NEXUS:

- the core Event Bus

Why it helps:

- keeps module boundaries explicit

Tradeoff:

- requires disciplined event naming and payload design

## 18. Design Tradeoffs

### In-memory bus vs external broker

Current choice:

- in-memory bus

Why:

- simple
- deterministic
- easy to test

Tradeoff:

- no cross-process or distributed delivery

### Sequential dispatch vs parallel dispatch

Current choice:

- sequential dispatch

Why:

- predictable order

Tradeoff:

- slower

### Fail-fast errors vs isolated handler errors

Current choice:

- fail-fast

Why:

- errors are obvious
- tests are simpler

Tradeoff:

- one bad handler stops later handlers

### Typed payloads at caller boundary vs opaque payloads inside the bus

Current choice:

- callers can type payloads
- the bus stores them generically

Why:

- type safety for callers
- implementation simplicity for the bus

Tradeoff:

- internal type precision is reduced

### Simple subscriptions by event type vs wildcard subscriptions

Current choice:

- exact string match by event type

Why:

- easy to understand
- easy to implement

Tradeoff:

- no pattern matching yet

### No persistence vs event log or event store

Current choice:

- no persistence

Why:

- current runtime is in-process and minimal

Tradeoff:

- events disappear when the process exits

### No request/reply yet vs future request/reply capability

Current choice:

- publish/subscribe only

Why:

- keeps the first implementation small

Tradeoff:

- command-style workflows need future expansion

### No backpressure yet vs future production event processing

Current choice:

- no backpressure control

Why:

- the current system is small and deterministic

Tradeoff:

- not suitable for heavy real-time event volume yet

## 19. What Is Implemented Today

Today the Event Bus is:

- in-process
- in-memory
- async
- sequential
- type-string-based
- minimal
- deterministic
- used by runtime lifecycle and plugins

## 20. What Is Not Implemented Yet

Today the Event Bus does not include:

- distributed messaging
- external broker integration
- persistence
- replay
- wildcard subscriptions
- request/reply
- retries
- dead-letter queues
- backpressure
- priority events
- event schema registry
- security or permission enforcement
- production-grade isolation

## 21. Common Confusions

1. Event Bus is not React Context.
   - Event Bus is a runtime communication mechanism.
   - React Context is a UI tree mechanism.

2. Event Bus is not `RuntimeSnapshot`.
   - Event Bus is live communication.
   - `RuntimeSnapshot` is a state model.

3. Event Bus is not the UI event system.
   - The bus is for runtime messages, not browser UI events.

4. Event Bus is not a network message broker yet.
   - It currently lives inside one process.

5. Publishing an event is not the same as commanding a robot directly.
   - Publishing is a communication action.
   - Robot command execution belongs elsewhere.

6. Subscribing to an event does not mean polling.
   - The handler runs when an event is published.

7. `payload` is not interpreted by the bus itself.
   - The bus only transports the event.

8. `type` is not a TypeScript type.
   - It is a runtime event name string.

9. `EventSubscription` is a token, not the handler itself.
   - It is used to unsubscribe later.

10. In-memory means events do not survive process restart.
    - There is no persistence layer.

11. Sequential dispatch means handlers do not run in parallel.
    - Each handler is awaited before the next one runs.

12. Fail-fast means one failing handler can stop later handlers.
    - The bus rejects immediately on error.

## 22. Generic Event Bus Example

Here is a generic example of how an Event Bus might be used:

```text
order.created
    ↓
inventory service subscribes and reserves stock
    ↓
email service subscribes and sends confirmation
    ↓
analytics service subscribes and records the event
```

The same pattern is what NEXUS uses for runtime events and plugin communication.

## 23. NEXUS Event Bus Walkthrough

This is the current NEXUS flow in plain English:

1. `BasicRuntime` creates an `InMemoryEventBus`.
2. The runtime exposes that bus through the runtime handle.
3. The runtime registers the bus in the service container.
4. The runtime passes the bus into `PluginContext`.
5. Plugins subscribe to events during `onStart`.
6. Plugins publish new events when they have something meaningful to emit.
7. The runtime publishes `core.runtime.started` after startup completes.
8. The runtime publishes `core.runtime.stopped` after controlled shutdown.

This makes the bus the shared message path inside the current runtime boundary.

## 24. Interview Explanation

If asked, “How does the NEXUS Event Bus work, and why does the project use it?”, a concise technical answer is:

NEXUS uses a small in-memory Event Bus to decouple runtime modules and plugins. Events are represented with a `NexusEvent` envelope that includes an id, type, source, timestamp, payload, and optional correlation id. Components call `publish()` to send an event and `subscribe()` to register handlers for a specific event type. The current `InMemoryEventBus` keeps subscriptions in memory, dispatches handlers sequentially with async `await`, and fails fast if a handler throws. The runtime uses the bus for lifecycle events and plugin communication, and future adapter integrations can publish normalized robotics events through the same boundary. The limitation is that this is currently in-process only, with no persistence, retries, distributed broker, or production event-processing features yet.

## 25. Self-Check Questions

- What problem does the Event Bus solve?
- What is publish/subscribe?
- What fields does `NexusEvent` contain?
- What is the difference between event `type` and TypeScript `type`?
- Why is payload generic?
- Why does `publish()` return `Promise<void>`?
- What happens if no subscribers exist?
- What happens if a handler throws?
- Why are handlers awaited sequentially?
- Why does the bus copy the subscriptions array before iteration?
- What does `subscribe()` return?
- Why is `EventSubscription` useful?
- How does `unsubscribe()` work?
- What does in-memory mean?
- How does the runtime use the Event Bus?
- How do plugins use the Event Bus?
- What event does the telemetry demo plugin subscribe to?
- What event does the telemetry demo plugin publish?
- Why is the Event Bus not the same as `RuntimeSnapshot`?
- What future capabilities could be added later?
- Why is `correlationId` useful even if it is not heavily used yet?
- Why is sequential dispatch easier to test than parallel dispatch?
- Why is exact event-type matching simpler than wildcard subscriptions?
- What is the tradeoff of fail-fast behavior?

## 26. Next Study Step

The next learning document should be:

```text
docs/learning/plugin-system-guide.md
```

That document should deeply analyze:

- `NexusPlugin`
- `NexusPluginManifest`
- `PluginContext`
- manifest validation
- descriptor discovery
- local plugin loader
- plugin registry
- plugin manager
- plugin lifecycle
- telemetry demo plugin lifecycle

