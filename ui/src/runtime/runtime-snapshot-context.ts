import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { RuntimeSnapshot } from '@/types/runtime-snapshot';
import type { MockRuntimeAdapter } from '@/runtime/mock-runtime-adapter';

export type RuntimeSnapshotContextValue = {
  snapshot: RuntimeSnapshot;
  adapter: MockRuntimeAdapter;
};

export const RuntimeSnapshotContext = createContext<RuntimeSnapshotContextValue | null>(null);

export const useRuntimeSnapshotContext = () => {
  const context = useContext(RuntimeSnapshotContext);
  if (!context) {
    throw new Error('RuntimeSnapshotProvider is required');
  }
  return context;
};

export const useRuntimeSnapshot = () => useRuntimeSnapshotContext().snapshot;
export const useRuntimeSnapshotAdapter = () => useRuntimeSnapshotContext().adapter;

export type RuntimeSnapshotProviderProps = {
  children: ReactNode;
};
