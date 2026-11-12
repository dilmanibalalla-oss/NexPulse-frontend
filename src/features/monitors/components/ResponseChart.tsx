import { useState } from 'react';
import { View } from 'react-native';

import type { ResponsePoint } from '@/features/monitors/historyView';
import { TrendChart } from '@/shared/charts';
import { Card, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type ResponseChartProps = {
  points: ResponsePoint[];
};

export function ResponseChart({ points }: ResponseChartProps) {
  const theme = useAppTheme();
  const [width, setWidth] = useState(0);

  return (
    <Card>
      <View style={{ gap: theme.spacing.md }}>
        <Text accessibilityRole="header" variant="heading">
          Response time
        </Text>
        {points.length === 0 ? (
          <Text variant="muted">No response times have been recorded yet.</Text>
        ) : (
          <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
            {width > 0 ? (
              <TrendChart
                width={width}
                points={points.map((point) => ({
                  value: point.value,
                  label: point.label,
                  dataPointColor: point.successful ? theme.colors.up : theme.colors.down,
                }))}
              />
            ) : null}
          </View>
        )}
      </View>
    </Card>
  );
}
