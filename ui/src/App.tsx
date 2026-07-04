import { Navigate, Route, Routes } from 'react-router-dom';
import { ShellFrame } from '@/components/layout/ShellFrame';
import { mockShellSnapshot } from '@/data/mock-shell';
import { useMockShellSnapshot } from '@/hooks/use-mock-shell-snapshot';

const ShellRoute = () => {
  const snapshot = useMockShellSnapshot();
  return <ShellFrame snapshot={snapshot.data ?? mockShellSnapshot} />;
};

export const App = () => (
  <Routes>
    <Route path="/" element={<Navigate replace to="/plugins" />} />
    <Route path="/:section" element={<ShellRoute />} />
    <Route path="*" element={<Navigate replace to="/plugins" />} />
  </Routes>
);
