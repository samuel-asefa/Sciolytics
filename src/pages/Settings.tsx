import { Palette, Sun } from 'lucide-react';
import { useTheme, type BrightnessMode } from '../contexts/ThemeContext';

const brightnessOptions: { value: BrightnessMode; label: string; desc: string }[] = [
  { value: 'light', label: '☀️ Light', desc: 'High contrast light mode' },
  { value: 'default', label: '🌤 Default', desc: 'The standard look' },
  { value: 'slightly-dark', label: '🌙 Dim', desc: 'Slightly darkened tones' },
  { value: 'dark', label: '🌑 Dark', desc: 'Dark mode with your color' },
  { value: 'darker', label: '⬛ Darker', desc: 'Deep dark mode' },
];

export default function Settings() {
  const { theme, brightness, setTheme, setBrightness } = useTheme();
  const themeColors = ['red', 'pink', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple'] as const;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Settings</h1>
          <p>Customize your Sciolytics experience</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={24} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Color Theme</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Choose a color for the application. Applied immediately.
          </p>
          <div className="theme-selector" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            {themeColors.map(t => (
              <button
                key={t}
                className={`theme-circle theme-${t} ${theme === t ? 'active' : ''}`}
                onClick={() => setTheme(t)}
                title={`Switch to ${t} theme`}
                style={{ width: '40px', height: '40px', cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div className="profile-card" style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sun size={24} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Brightness</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Adjust the brightness level while keeping your color theme.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {brightnessOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setBrightness(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: brightness === opt.value ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                  background: brightness === opt.value ? 'color-mix(in srgb, var(--primary-color) 10%, transparent)' : 'var(--bg-white)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '22px' }}>{opt.label.split(' ')[0]}</span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
