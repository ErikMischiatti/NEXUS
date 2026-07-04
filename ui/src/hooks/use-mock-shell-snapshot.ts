import { useQuery } from '@tanstack/react-query';
import { mockShellSnapshot } from '@/data/mock-shell';

export const useMockShellSnapshot = () =>
  useQuery({
    queryKey: ['mock-shell-snapshot'],
    queryFn: async () => mockShellSnapshot,
    initialData: mockShellSnapshot,
    staleTime: Number.POSITIVE_INFINITY,
  });
