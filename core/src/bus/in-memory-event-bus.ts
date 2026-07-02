import {
  type EventBus,
  type EventHandler,
  type EventSubscription,
  type NexusEvent,
} from "./types.js";

type SubscriptionRecord = EventSubscription & {
  handler: EventHandler<unknown>;
};

/**
 * In-process event bus with async dispatch.
 *
 * Handlers are invoked in subscription order and awaited sequentially.
 * If a handler throws or rejects, publish() rejects immediately and later
 * handlers for that event are not invoked.
 */
export class InMemoryEventBus implements EventBus {
  private readonly subscriptionsByType = new Map<string, SubscriptionRecord[]>();
  private nextSubscriptionId = 0;

  async publish<TPayload>(event: NexusEvent<TPayload>): Promise<void> {
    const subscriptions = this.subscriptionsByType.get(event.type);
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    for (const subscription of [...subscriptions]) {
      await subscription.handler(event);
    }
  }

  subscribe<TPayload>(
    type: string,
    handler: EventHandler<TPayload>,
  ): EventSubscription {
    const subscription: SubscriptionRecord = {
      id: `sub-${++this.nextSubscriptionId}`,
      type,
      handler: handler as EventHandler<unknown>,
    };

    const subscriptions = this.subscriptionsByType.get(type);
    if (subscriptions) {
      subscriptions.push(subscription);
    } else {
      this.subscriptionsByType.set(type, [subscription]);
    }

    return { id: subscription.id, type: subscription.type };
  }

  unsubscribe(subscription: EventSubscription): void {
    const subscriptions = this.subscriptionsByType.get(subscription.type);
    if (!subscriptions) {
      return;
    }

    const nextSubscriptions = subscriptions.filter(
      (record) => record.id !== subscription.id,
    );

    if (nextSubscriptions.length === 0) {
      this.subscriptionsByType.delete(subscription.type);
      return;
    }

    this.subscriptionsByType.set(subscription.type, nextSubscriptions);
  }
}
