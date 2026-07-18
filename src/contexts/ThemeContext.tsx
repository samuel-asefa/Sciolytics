import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ColorTheme = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'pink' | 'yellow' | 'indigo';
export type BrightnessMode = 'light' | 'default' | 'slightly-dark' | 'dark' | 'darker';

interface ThemeContextType {
  theme: ColorTheme;
  brightness: BrightnessMode;
  dynamicBg: boolean;
  setTheme: (theme: ColorTheme) => void;
  setBrightness: (mode: BrightnessMode) => void;
  setDynamicBg: (dynamic: boolean) => void;
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

  const [dynamicBg, setDynamicBgState] = useState<boolean>(() => {
    const saved = localStorage.getItem('dynamicBg');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-brightness', brightness);
    localStorage.setItem('theme', theme);
    localStorage.setItem('brightness', brightness);
  }, [theme, brightness]);

  useEffect(() => {
    if (dynamicBg) {
      document.documentElement.removeAttribute('data-static-bg');
    } else {
      document.documentElement.setAttribute('data-static-bg', 'true');
    }
    localStorage.setItem('dynamicBg', String(dynamicBg));
  }, [dynamicBg]);

  const setTheme = (newTheme: ColorTheme) => setThemeState(newTheme);
  const setBrightness = (mode: BrightnessMode) => setBrightnessState(mode);
  const setDynamicBg = (dynamic: boolean) => setDynamicBgState(dynamic);

  return (
    <ThemeContext.Provider value={{ theme, brightness, dynamicBg, setTheme, setBrightness, setDynamicBg }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
