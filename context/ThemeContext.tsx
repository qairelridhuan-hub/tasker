import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  danger: string;
  success: string;
  warning: string;
  isDark: boolean;
}

const light: Theme = {
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',
  text: '#000000',
  textMuted: '#999999',
  border: '#E8E8E8',
  accent: '#000000',
  accentText: '#FFFFFF',
  danger: '#111111',
  success: '#444444',
  warning: '#777777',
  isDark: false,
};

const dark: Theme = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceAlt: '#242424',
  text: '#FFFFFF',
  textMuted: '#666666',
  border: '#2A2A2A',
  accent: '#FFFFFF',
  accentText: '#000000',
  danger: '#EEEEEE',
  success: '#AAAAAA',
  warning: '#888888',
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: light,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('tasker:theme').then(v => {
      if (v === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(p => {
      const next = !p;
      AsyncStorage.setItem('tasker:theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? dark : light, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
