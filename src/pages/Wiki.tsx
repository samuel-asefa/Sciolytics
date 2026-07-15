import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { wikiData } from '../data/wikiData';

export default function Wiki() {
  const events = Object.values(wikiData).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1>Internal Event Resource Pages (Wiki)</h1>
        <p>Explore a comprehensive collection of resources and notes for all standard Science Olympiad events.</p>
      </div>

      <div className="events-panel" style={{ gridColumn: 'span 2', padding: '30px', maxHeight: 'none' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          Science Olympiad Events
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {events.map((event) => (
            <Link key={event.id} to={`/wiki/${event.id}`} className="action-card" style={{ textDecoration: 'none' }}>
              <FileText className="action-icon blue" size={24} />
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{event.name}</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>{event.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
