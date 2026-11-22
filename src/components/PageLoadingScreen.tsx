import { useEffect, useState } from 'react';
import { LogoMark } from './Logo';

interface PageLoadingScreenProps {
  loading: boolean;
  /** Short label under the spinner. */
  label?: string;
}

/**
 * Full-screen splash used only while the app boots (auth resolving).
 * Router-independent so it can render above <BrowserRouter>.
 */
export function BootSplash() {
  return (
    <div className="boot-splash" role="status" aria-live="polite">
      <div className="boot-splash-mark">
        <span className="boot-splash-ring" />
        <LogoMark size={44} />
      </div>
      <span className="visually-hidden">Loading Sciolytics…</span>
    </div>
  );
}

/**
 * In-page loader. Waits 180ms before showing so fast loads never flash,
 * and renders inside the page (no more full-screen takeover on every route).
 */
export default function PageLoadingScreen({ loading, label }: PageLoadingScreenProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), 180);
    return () => clearTimeout(t);
  }, [loading]);

  if (!loading || !show) return null;

  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader-spinner" />
      <span className="page-loader-label">{label ?? 'Loading'}</span>
    </div>
  );
}
