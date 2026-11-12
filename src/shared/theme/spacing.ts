export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const layout = {
  minTouchTarget: 44,
  controlHeight: 48,
  controlHeightLarge: 52,
  content: 480,
  contentWide: 720,
  compact: 600,
  tablet: 840,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
