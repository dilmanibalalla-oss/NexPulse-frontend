import { LineChart, type lineDataItem } from 'react-native-gifted-charts';

import { chartTheme } from '@/shared/charts/chartTheme';
import { spacing } from '@/shared/theme/spacing';

type TrendChartProps = {
  points: lineDataItem[];
  width: number;
};

export function TrendChart({ points, width }: TrendChartProps) {
  const plotWidth = Math.max(160, width - 56);
  const gaps = Math.max(points.length - 1, 1);
  const pointSpacing = Math.max(12, (plotWidth - spacing.md * 2) / gaps);

  return (
    <LineChart
      data={points}
      width={plotWidth}
      height={180}
      color={chartTheme.line}
      thickness={2}
      curved
      isAnimated
      disableScroll
      noOfSections={4}
      spacing={pointSpacing}
      initialSpacing={spacing.md}
      endSpacing={spacing.md}
      rulesColor={chartTheme.rules}
      yAxisColor={chartTheme.rules}
      xAxisColor={chartTheme.rules}
      yAxisTextStyle={{ color: chartTheme.label, fontSize: 11 }}
      xAxisLabelTextStyle={{ color: chartTheme.label, fontSize: 11 }}
      backgroundColor={chartTheme.background}
    />
  );
}
