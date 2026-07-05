import { Navigate, Route, Routes } from 'react-router-dom';
import { ShellFrame } from '@/components/layout/ShellFrame';
import { useRuntimeSnapshot } from '@/hooks/use-mock-shell-snapshot';

const ShellRoute = () => {
  const snapshot = useRuntimeSnapshot();
  return <ShellFrame snapshot={snapshot} />;
};

export const App = () => (
  <Routes>
    <Route path="/" element={<Navigate replace to="/plugins" />} />
    <Route path="/:section" element={<ShellRoute />} />
    <Route path="*" element={<Navigate replace to="/plugins" />} />
  </Routes>
);
