import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, ThemeMode, LightColors, DarkColors } from '../constants/theme';
import { getSetting, setSetting } from '../database/repositories/settingsRepository';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeMode: 'system',
  colors: DarkColors,
  isDark: true,
  setThemeMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load stored preference
    getSetting('theme_mode').then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeModeState(saved as ThemeMode);
      }
    }).catch((err) => {
      console.warn('Failed to load theme preference:', err);
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await setSetting('theme_mode', mode);
    } catch (err) {
      console.warn('Failed to persist theme preference:', err);
    }
  };

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';
    return systemScheme === 'light' ? 'light' : 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    return resolvedTheme === 'light' ? LightColors : DarkColors;
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      themeMode,
      colors,
      isDark: resolvedTheme === 'dark',
      setThemeMode,
    }),
    [resolvedTheme, themeMode, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
