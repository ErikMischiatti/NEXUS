export type NexusEvent<TPayload = unknown> = {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payload: TPayload;
  correlationId?: string;
};

export type EventHandler<TPayload = unknown> = (
  event: NexusEvent<TPayload>,
) => void | Promise<void>;

export type EventSubscription = {
  id: string;
  type: string;
};

export interface EventBus {
  publish<TPayload>(event: NexusEvent<TPayload>): Promise<void>;
  subscribe<TPayload>(
    type: string,
    handler: EventHandler<TPayload>,
  ): EventSubscription;
  unsubscribe(subscription: EventSubscription): void;
}
