import { createContext, useContext, type ReactNode } from 'react';

import { theme, type AppTheme } from '@/shared/theme/theme';

const ThemeContext = createContext<AppTheme>(theme);

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  return useContext(ThemeContext);
}
