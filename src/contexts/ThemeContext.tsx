import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ColorTheme = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'pink' | 'yellow' | 'indigo';
export type BrightnessMode = 'light' | 'default' | 'slightly-dark' | 'dark' | 'darker';
export type BackgroundStyle = 'dynamic-gradient' | 'static-gradient' | 'stars' | 'particles' | 'wind' | 'circuits' | 'city';

interface ThemeContextType {
  theme: ColorTheme;
  brightness: BrightnessMode;
  bgStyle: BackgroundStyle;
  setTheme: (theme: ColorTheme) => void;
  setBrightness: (mode: BrightnessMode) => void;
  setBgStyle: (style: BackgroundStyle) => void;
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

  const [bgStyle, setBgStyleState] = useState<BackgroundStyle>(() => {
    const saved = localStorage.getItem('bgStyle') as BackgroundStyle;
    const allowedStyles: BackgroundStyle[] = ['dynamic-gradient', 'static-gradient', 'stars', 'particles', 'wind', 'circuits', 'city'];
    
    // Handle migration from old dynamicBg boolean
    if (saved === undefined || saved === null) {
      const oldDynamicBg = localStorage.getItem('dynamicBg');
      if (oldDynamicBg !== null) {
        localStorage.removeItem('dynamicBg');
        return oldDynamicBg === 'false' ? 'static-gradient' : 'dynamic-gradient';
      }
      return 'dynamic-gradient';
    }
    
    return allowedStyles.includes(saved) ? saved : 'dynamic-gradient';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-brightness', brightness);
    localStorage.setItem('theme', theme);
    localStorage.setItem('brightness', brightness);
  }, [theme, brightness]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bg-style', bgStyle);
    localStorage.setItem('bgStyle', bgStyle);
  }, [bgStyle]);

  const setTheme = (newTheme: ColorTheme) => setThemeState(newTheme);
  const setBrightness = (mode: BrightnessMode) => setBrightnessState(mode);
  const setBgStyle = (style: BackgroundStyle) => setBgStyleState(style);

  return (
    <ThemeContext.Provider value={{ theme, brightness, bgStyle, setTheme, setBrightness, setBgStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
