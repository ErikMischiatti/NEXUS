import type { PropsWithChildren } from 'react';
import { RuntimeSnapshotProvider } from '@/runtime/runtime-snapshot-provider';

export const AppProviders = ({ children }: PropsWithChildren) => <RuntimeSnapshotProvider>{children}</RuntimeSnapshotProvider>;
