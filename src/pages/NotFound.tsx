import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="ui-page">
      <div className="ui-empty" style={{ minHeight: '56vh' }}>
        <div className="ui-empty-icon"><Compass size={26} /></div>
        <span className="ui-eyebrow">Error 404</span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
          This page drifted out of <span className="ui-serif" style={{ fontStyle: 'italic' }}>orbit</span>.
        </h1>
        <p>The link may be broken or the page may have moved. Try search with <kbd className="ui-kbd">/</kbd>, or head back.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="ui-btn ui-btn-primary"><ArrowLeft size={16} /> Go home</Link>
          <Link to="/wiki" className="ui-btn ui-btn-outline">Browse the wiki</Link>
        </div>
      </div>
    </div>
  );
}
