import { View } from 'react-native';

import { StatCard } from '@/features/dashboard/components/StatCard';
import type { DashboardSummary } from '@/features/dashboard/summary';
import { useAppTheme, useResponsive } from '@/shared/theme';

type StatGridProps = {
  summary: DashboardSummary;
};

export function StatGrid({ summary }: StatGridProps) {
  const theme = useAppTheme();
  const responsive = useResponsive();
  const columns = responsive.isTablet ? 4 : 2;
  const gap = theme.spacing.md;
  const innerWidth =
    Math.min(responsive.width, responsive.contentMaxWidth) - responsive.horizontalPadding * 2;
  const cardWidth = Math.floor((innerWidth - gap * (columns - 1)) / columns);
  const cards = [
    {
      label: 'Monitors',
      value: String(summary.total),
      tone: 'accent' as const,
      accessibilityLabel: `Total monitors, ${summary.total}`,
    },
    {
      label: 'Up',
      value: String(summary.up),
      tone: 'up' as const,
      accessibilityLabel: `Websites currently up, ${summary.up}`,
    },
    {
      label: 'Down',
      value: String(summary.down),
      tone: 'down' as const,
      accessibilityLabel: `Websites currently down, ${summary.down}`,
    },
    {
      label: 'Unknown',
      value: String(summary.unknown),
      tone: 'unknown' as const,
      accessibilityLabel: `Unknown statuses, ${summary.unknown}`,
    },
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {cards.map((card) => (
        <View key={card.label} style={{ width: cardWidth }}>
          <StatCard {...card} />
        </View>
      ))}
    </View>
  );
}
