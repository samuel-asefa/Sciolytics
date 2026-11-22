import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ColorTheme = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'pink' | 'yellow' | 'indigo';
export type BrightnessMode = 'light' | 'default' | 'slightly-dark' | 'dark' | 'darker';
export type BackgroundStyle = 'dynamic-gradient' | 'static-gradient' | 'stars' | 'particles' | 'wind' | 'circuits' | 'city';

const THEMES: ColorTheme[] = ['blue', 'green', 'orange', 'purple', 'red', 'teal', 'pink', 'yellow', 'indigo'];
const BRIGHTNESS: BrightnessMode[] = ['light', 'default', 'slightly-dark', 'dark', 'darker'];
const BG_STYLES: BackgroundStyle[] = ['dynamic-gradient', 'static-gradient', 'stars', 'particles', 'wind', 'circuits', 'city'];

interface ThemeContextType {
  theme: ColorTheme;
  brightness: BrightnessMode;
  bgStyle: BackgroundStyle;
  isDark: boolean;
  setTheme: (theme: ColorTheme) => void;
  setBrightness: (mode: BrightnessMode) => void;
  setBgStyle: (style: BackgroundStyle) => void;
  /** Flip between the user's light and dark preference. */
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    const saved = read('theme') as ColorTheme;
    return THEMES.includes(saved) ? saved : 'blue';
  });

  // First visit follows the OS; after that the user's explicit choice wins.
  const [brightness, setBrightnessState] = useState<BrightnessMode>(() => {
    const saved = read('brightness') as BrightnessMode;
    if (BRIGHTNESS.includes(saved)) return saved;
    return systemPrefersDark() ? 'dark' : 'default';
  });

  const [bgStyle, setBgStyleState] = useState<BackgroundStyle>(() => {
    const saved = read('bgStyle') as BackgroundStyle;
    if (saved === null) {
      const oldDynamicBg = read('dynamicBg');
      if (oldDynamicBg !== null) {
        try { localStorage.removeItem('dynamicBg'); } catch { /* ignore */ }
        return oldDynamicBg === 'false' ? 'static-gradient' : 'dynamic-gradient';
      }
      return 'dynamic-gradient';
    }
    return BG_STYLES.includes(saved) ? saved : 'dynamic-gradient';
  });

  const [explicitBrightness, setExplicitBrightness] = useState(() => read('brightness') !== null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    write('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-brightness', brightness);
    if (explicitBrightness) write('brightness', brightness);
  }, [brightness, explicitBrightness]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bg-style', bgStyle);
    write('bgStyle', bgStyle);
  }, [bgStyle]);

  // Track OS changes until the user picks a mode themselves.
  useEffect(() => {
    if (explicitBrightness) return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = () => setBrightnessState(mq.matches ? 'dark' : 'default');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [explicitBrightness]);

  const isDark = brightness === 'slightly-dark' || brightness === 'dark' || brightness === 'darker';

  const setBrightness = (mode: BrightnessMode) => {
    setExplicitBrightness(true);
    setBrightnessState(mode);
  };

  const toggleDark = () => {
    if (isDark) {
      setBrightness((read('lastLightBrightness') as BrightnessMode) || 'default');
    } else {
      write('lastLightBrightness', brightness);
      setBrightness((read('lastDarkBrightness') as BrightnessMode) || 'dark');
    }
  };

  useEffect(() => {
    if (isDark) write('lastDarkBrightness', brightness);
  }, [isDark, brightness]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        brightness,
        bgStyle,
        isDark,
        setTheme: setThemeState,
        setBrightness,
        setBgStyle: setBgStyleState,
        toggleDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
