import type { PropsWithChildren } from 'react';

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
}>;

export const Badge = ({ tone = 'neutral', children }: BadgeProps) => (
  <span className={`nexus-badge nexus-badge--${tone}`}>{children}</span>
);
