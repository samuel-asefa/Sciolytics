import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Wrench, Microscope, ChevronRight } from 'lucide-react';
import { wikiData } from '../data/wikiData';
import './Wiki.css';

const CATEGORIES = ['All', 'Study', 'Engineering', 'Hybrid'] as const;

const categoryIcon = {
  'Study': <BookOpen size={16} />,
  'Engineering': <Wrench size={16} />,
  'Hybrid': <Microscope size={16} />,
};

const categoryColors: Record<string, string> = {
  'Engineering': '#4a7c59',
  'Study': '#4b6ba2',
  'Hybrid': '#7c4a7c',
};

export default function Wiki() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<typeof CATEGORIES[number]>('All');

  const all = Object.values(wikiData).sort((a, b) => a.name.localeCompare(b.name));

  const visible = all.filter(ev => {
    const matchesSearch = ev.name.toLowerCase().includes(query.toLowerCase()) ||
      ev.description.toLowerCase().includes(query.toLowerCase());
    const matchesCat = filter === 'All' || ev.infobox?.type === filter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="wiki-home-wrapper">
      {/* Header */}
      <div className="wiki-home-header">
        <div>
          <h1 className="wiki-home-title">Sciolytics Wiki</h1>
          <p className="wiki-home-subtitle">
            Internal study notes and resources for all Science Olympiad Division C events.
          </p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="wiki-home-controls">
        <div className="wiki-search-wrap">
          <Search size={16} className="wiki-search-icon" />
          <input
            className="wiki-search-input"
            placeholder="Search events…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="wiki-filter-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`wiki-filter-tab ${filter === cat ? 'wiki-filter-active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat !== 'All' && categoryIcon[cat as keyof typeof categoryIcon]}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="wiki-results-count">
        Showing <strong>{visible.length}</strong> of {all.length} events
      </p>

      {/* Event grid */}
      <div className="wiki-event-grid">
        {visible.map(event => {
          const type = event.infobox?.type ?? 'Study';
          const color = categoryColors[type] ?? '#4b6ba2';
          const hasContent = event.subtopics.length > 0;
          return (
            <Link key={event.id} to={`/wiki/${event.id}`} className="wiki-event-card">
              <div className="wiki-event-card-accent" style={{ background: color }} />
              <div className="wiki-event-card-body">
                <div className="wiki-event-card-type" style={{ color, background: `${color}18` }}>
                  {categoryIcon[type as keyof typeof categoryIcon]}
                  {type}
                </div>
                <h3 className="wiki-event-card-name">{event.name}</h3>
                <p className="wiki-event-card-desc">{event.description}</p>
                <div className="wiki-event-card-footer">
                  <span className={`wiki-event-card-status ${hasContent ? 'wiki-status-has' : 'wiki-status-stub'}`}>
                    {hasContent ? `${event.subtopics.length} sections` : 'Stub'}
                  </span>
                  <span className="wiki-event-card-arrow">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="wiki-no-results">
          <p>No events match your search.</p>
        </div>
      )}
    </div>
  );
}
