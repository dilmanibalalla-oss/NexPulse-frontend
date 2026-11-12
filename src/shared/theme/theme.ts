import { colors } from '@/shared/theme/colors';
import { layout, radius, spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

export const status = {
  UP: {
    label: 'Up',
    foreground: colors.up,
    background: colors.upMuted,
  },
  DOWN: {
    label: 'Down',
    foreground: colors.down,
    background: colors.downMuted,
  },
  UNKNOWN: {
    label: 'Unknown',
    foreground: colors.unknown,
    background: colors.unknownMuted,
  },
} as const;

export type MonitorStatus = keyof typeof status;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  layout,
  status,
} as const;

export type AppTheme = typeof theme;
