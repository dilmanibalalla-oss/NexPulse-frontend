import { Stack } from 'expo-router';

import { colors } from '@/shared/theme';

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
