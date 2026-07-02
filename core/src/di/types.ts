export type ServiceKey<T> = {
  readonly name: string;
  readonly token: symbol;
};

export const createServiceKey = <T>(name: string): ServiceKey<T> =>
  Object.freeze({
    name,
    token: Symbol(name),
  });

export interface ServiceContainer {
  register<T>(key: ServiceKey<T>, value: T): void;
  get<T>(key: ServiceKey<T>): T;
  optional<T>(key: ServiceKey<T>): T | undefined;
  has<T>(key: ServiceKey<T>): boolean;
  listKeys(): ServiceKey<unknown>[];
}
