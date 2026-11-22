import { useId } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** Use the active theme colours instead of the fixed brand gradient. */
  themed?: boolean;
}

/** The Sciolytics mark: two crossing orbits, a nucleus, and a gold "electron". */
export function LogoMark({ size = 28, className, themed = true }: LogoMarkProps) {
  const id = useId().replace(/:/g, '');
  const from = themed ? 'var(--primary-color, #1f6feb)' : '#1f6feb';
  const to = themed ? 'var(--accent-2, #06b6d4)' : '#06b6d4';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`lg-${id}`} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: from }} />
          <stop offset="1" style={{ stopColor: to }} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#lg-${id})`} />
      <g fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round">
        <ellipse cx="32" cy="32" rx="21" ry="8.5" transform="rotate(-38 32 32)" />
        <ellipse cx="32" cy="32" rx="21" ry="8.5" transform="rotate(38 32 32)" strokeOpacity=".55" />
      </g>
      <circle cx="32" cy="32" r="5.2" fill="#fff" />
      <circle cx="48.6" cy="18.6" r="3.6" fill="#ffd166" />
    </svg>
  );
}

export default function Logo({ size = 28, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="brand">
      <LogoMark size={size} />
      {showText && <span className="brand-text">Sciolytics</span>}
    </span>
  );
}
