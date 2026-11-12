import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { apiClient } from '@/shared/api/client';
import { BootScreen } from '@/shared/components';
import { navigationTheme } from '@/shared/navigation/theme';
import { useSessionStore } from '@/shared/state/sessionStore';
import { AppThemeProvider, colors } from '@/shared/theme';

if (!apiClient.defaults.baseURL) {
  throw new Error('EXPO_PUBLIC_API_URL did not configure the API client.');
}

export default function RootLayout() {
  const hydrated = useSessionStore((state) => state.hydrated);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
    void useSessionStore.getState().hydrate();
  }, []);

  return (
    <AppThemeProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        {hydrated ? (
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        ) : (
          <BootScreen />
        )}
      </ThemeProvider>
    </AppThemeProvider>
  );
}
