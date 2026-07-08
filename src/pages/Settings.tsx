import { Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const themeColors = [
    'red',
    'pink',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'indigo',
    'purple'
  ] as const;

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
          <div className="theme-settings-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={24} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>App Theme</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Choose a color theme for the application. Your selection will be applied immediately.
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
      </div>
    </div>
  );
}
