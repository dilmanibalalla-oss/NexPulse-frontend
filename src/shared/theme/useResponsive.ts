import { useWindowDimensions } from 'react-native';

import { useAppTheme } from '@/shared/theme/ThemeProvider';

export function useResponsive() {
  const theme = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= theme.layout.tablet;
  const isCompact = width < theme.layout.compact;

  return {
    width,
    height,
    isTablet,
    isCompact,
    contentMaxWidth: isTablet ? theme.layout.contentWide : theme.layout.content,
    horizontalPadding: isCompact ? theme.spacing.xl : theme.spacing.xxl,
    sectionGap: isCompact ? theme.spacing.xl : theme.spacing.xxl,
  };
}
