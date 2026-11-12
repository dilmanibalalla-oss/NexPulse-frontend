import { LineChart, type lineDataItem } from 'react-native-gifted-charts';

import { chartTheme } from '@/shared/charts/chartTheme';
import { spacing } from '@/shared/theme/spacing';

type TrendChartProps = {
  points: lineDataItem[];
};

export function TrendChart({ points }: TrendChartProps) {
  return (
    <LineChart
      data={points}
      color={chartTheme.line}
      thickness={2}
      curved
      isAnimated
      noOfSections={4}
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
