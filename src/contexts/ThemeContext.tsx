import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ColorTheme = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'pink' | 'yellow' | 'indigo';
export type BrightnessMode = 'light' | 'default' | 'slightly-dark' | 'dark' | 'darker';

interface ThemeContextType {
  theme: ColorTheme;
  brightness: BrightnessMode;
  setTheme: (theme: ColorTheme) => void;
  setBrightness: (mode: BrightnessMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('theme') as ColorTheme;
    return (['blue', 'green', 'orange', 'purple', 'red', 'teal', 'pink', 'yellow', 'indigo'].includes(saved)) ? saved : 'blue';
  });

  const [brightness, setBrightnessState] = useState<BrightnessMode>(() => {
    const saved = localStorage.getItem('brightness') as BrightnessMode;
    return (['light', 'default', 'slightly-dark', 'dark', 'darker'].includes(saved)) ? saved : 'default';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-brightness', brightness);
    localStorage.setItem('theme', theme);
    localStorage.setItem('brightness', brightness);
  }, [theme, brightness]);

  const setTheme = (newTheme: ColorTheme) => setThemeState(newTheme);
  const setBrightness = (mode: BrightnessMode) => setBrightnessState(mode);

  return (
    <ThemeContext.Provider value={{ theme, brightness, setTheme, setBrightness }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
