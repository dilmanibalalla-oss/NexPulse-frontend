import { Stack } from 'expo-router';

import { AlertWatch } from '@/features/notifications/AlertWatch';
import { colors } from '@/shared/theme';

export default function DashboardLayout() {
  return (
    <>
      <AlertWatch />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
