export const shellColors = {
  background: '#0f1117',
  backgroundElevated: '#151a23',
  backgroundInset: '#0b0e14',
  surface: '#1a2030',
  surfaceHover: '#20273a',
  border: '#2a3245',
  borderStrong: '#3c4762',
  text: '#e4e9f2',
  textMuted: '#9aa6bb',
  textSubtle: '#6f7a8f',
  accent: '#7c9cff',
  accentSoft: '#3c57a7',
  success: '#6fd08c',
  warning: '#f0b35e',
  danger: '#ef6f72',
  info: '#66b3ff',
} as const;

export const shellTypography = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  monoFontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
  textXs: '0.75rem',
  textSm: '0.875rem',
  textBase: '1rem',
  textLg: '1.125rem',
  textXl: '1.25rem',
  text2xl: '1.5rem',
} as const;

export const shellSpacing = {
  xxs: '0.25rem',
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  xxl: '2rem',
} as const;

export const shellLayout = {
  topBarHeight: '4.75rem',
  activityBarWidth: '5rem',
  sidebarWidth: '19rem',
  eventPanelHeight: '13rem',
  statusAreaWidth: '19rem',
  contentMaxWidth: '100%',
} as const;

export const shellPanelSizes = {
  compact: '18rem',
  regular: '24rem',
  wide: '32rem',
} as const;

export const shellSections = [
  {
    id: 'plugins',
    label: 'Plugins',
    shortLabel: 'PL',
    description: 'Hosted plugin views and extension points.',
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    shortLabel: 'WS',
    description: 'Operator workspace presets and context.',
  },
  {
    id: 'events',
    label: 'Events',
    shortLabel: 'EV',
    description: 'Runtime and plugin event stream.',
  },
  {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'ST',
    description: 'Shell preferences and display options.',
  },
] as const;

export type ShellSectionId = (typeof shellSections)[number]['id'];

export const defaultShellSection: ShellSectionId = 'plugins';
