import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Wrench, Microscope, ArrowRight, FileText } from 'lucide-react';
import { wikiData } from '../data/wikiData';
import { EVENTS } from '../lib/events';
import './Wiki.css';

const CATEGORIES = ['All', 'Study', 'Engineering', 'Hybrid'] as const;

const categoryIcon = {
  Study: <BookOpen size={13} />,
  Engineering: <Wrench size={13} />,
  Hybrid: <Microscope size={13} />,
};

export default function Wiki() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<typeof CATEGORIES[number]>('All');

  const all = Object.values(wikiData).sort((a, b) => {
    const d = b.subtopics.length - a.subtopics.length;
    return d !== 0 ? Math.sign(d) : a.name.localeCompare(b.name);
  });

  const visible = all.filter(ev => {
    const q = query.toLowerCase();
    const matchesSearch = ev.name.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q);
    const matchesCat = filter === 'All' || ev.infobox?.type === filter;
    return matchesSearch && matchesCat;
  });

  const written = all.filter(e => e.subtopics.length > 0).length;

  return (
    <div className="wiki-home ui-page">
      <header className="wiki-home-hero">
        <span className="ui-eyebrow"><BookOpen size={13} /> Study hub</span>
        <h1>The Sciolytics <span className="ui-serif" style={{ fontStyle: 'italic' }}>Event Wiki</span></h1>
        <p>Clean, distraction-free notes for every 2026 Science Olympiad event. Highlight, annotate and turn your notes into a cheat sheet.</p>
        <div className="wiki-home-controls">
          <label className="ui-search wiki-home-search">
            <Search size={16} />
            <input className="ui-input" placeholder="Search events or topics…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search the wiki" />
          </label>
          <div className="wiki-home-filters" role="tablist">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`ui-chip${filter === cat ? ' is-active' : ''}`} onClick={() => setFilter(cat)}>
                {cat !== 'All' && categoryIcon[cat]}
                {cat === 'All' ? 'All events' : cat}
              </button>
            ))}
          </div>
        </div>
        <p className="wiki-home-count">{written} of {all.length} event pages written · {visible.length} shown</p>
      </header>

      <div className="wiki-grid">
        {visible.map(event => {
          const meta = EVENTS.find(e => e.wikiId === event.id);
          const Icon = meta?.icon ?? FileText;
          const color = meta?.color ?? '#64748b';
          const sections = event.subtopics.length;
          return (
            <Link key={event.id} to={`/wiki/${event.id}`} className={`wiki-tile${sections === 0 ? ' is-stub' : ''}`} style={{ ['--ev' as string]: color }}>
              <div className="wiki-tile-top">
                <span className="wiki-tile-icon"><Icon size={18} /></span>
                <span className={`wiki-tile-status${sections ? ' has' : ''}`}>{sections ? `${sections} section${sections === 1 ? '' : 's'}` : 'Stub'}</span>
              </div>
              <h3>{event.name}</h3>
              <p>{event.description}</p>
              <div className="wiki-tile-foot">
                <span>{event.infobox?.type ?? 'Event'}{event.infobox?.category ? ` · ${event.infobox.category}` : ''}</span>
                <ArrowRight size={15} />
              </div>
            </Link>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="ui-empty"><p>No events match “{query}”.</p></div>
      )}
    </div>
  );
}
