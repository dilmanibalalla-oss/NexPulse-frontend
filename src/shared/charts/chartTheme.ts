import { colors } from '@/shared/theme/colors';

export const chartTheme = {
  line: colors.accent,
  rules: colors.border,
  label: colors.textMuted,
  background: colors.surface,
  up: colors.up,
  down: colors.down,
  unknown: colors.unknown,
} as const;
