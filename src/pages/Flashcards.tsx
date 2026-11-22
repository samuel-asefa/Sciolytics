import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Flame, Brain, Sparkles, ArrowRight, AlertTriangle, Search, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { questionService } from '../services/questionService';
import { studyService, type CardState } from '../services/studyService';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { STUDY_EVENTS, CATEGORY_SHORT } from '../lib/events';
import './Flashcards.css';

interface DeckStats { total: number; fresh: number; due: number; mastered: number; seen: number }

export default function Flashcards() {
  const { currentUser } = useAuth();
  const { summary } = useUserData();
  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<Record<string, CardState>>({});
  const [query, setQuery] = useState('');
  const [mineOnly, setMineOnly] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([questionService.initialize(), studyService.getCards(currentUser.uid)])
      .then(([, c]) => setCards(c))
      .finally(() => setReady(true));
  }, [currentUser]);

  const { decks, totals, mistakes } = useMemo(() => {
    const now = Date.now();
    const all = ready ? questionService.getAllQuestions() : [];
    const decks: Record<string, DeckStats> = {};
    let mistakes = 0;
    all.forEach(q => {
      const d = (decks[q.event] ??= { total: 0, fresh: 0, due: 0, mastered: 0, seen: 0 });
      d.total += 1;
      const s = cards[q.id];
      if (!s || s.reviews === 0) { d.fresh += 1; if (s?.missed) { d.due += 1; mistakes += 1; } return; }
      d.seen += 1;
      if (s.due <= now) d.due += 1;
      if (s.box >= 4) d.mastered += 1;
      if (s.missed || s.lapses > 0) mistakes += 1;
    });
    const totals = Object.values(decks).reduce(
      (a, d) => ({ due: a.due + d.due, mastered: a.mastered + d.mastered, seen: a.seen + d.seen }),
      { due: 0, mastered: 0, seen: 0 }
    );
    return { decks, totals, mistakes };
  }, [cards, ready]);

  if (!ready) return <PageLoadingScreen loading label="Shuffling decks" />;

  const favorites = summary?.favorites ?? [];
  const visible = STUDY_EVENTS
    .filter(e => (decks[e.name]?.total ?? 0) >= 5)
    .filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    .filter(e => !mineOnly || favorites.includes(e.name))
    .sort((a, b) => {
      const af = favorites.includes(a.name), bf = favorites.includes(b.name);
      if (af !== bf) return af ? -1 : 1;
      return (decks[b.name]?.due ?? 0) - (decks[a.name]?.due ?? 0);
    });

  return (
    <div className="ui-page flash-home">
      <header className="ui-page-head">
        <div>
          <span className="ui-eyebrow"><Layers size={13} /> Spaced repetition</span>
          <h1>Flashcards</h1>
          <p>Every question in the bank becomes a card. Rate how well you knew it, and cards you struggle with come back sooner.</p>
        </div>
      </header>

      <section className="flash-hero">
        <Link to="/flashcards/due" className={`ui-card flash-hero-main${totals.due === 0 ? ' is-clear' : ''}`}>
          <div>
            <span className="flash-hero-label">Due for review</span>
            <span className="flash-hero-num ui-tnum">{totals.due}</span>
            <span className="flash-hero-sub">{totals.due ? 'Clear your queue to keep memories fresh.' : 'All caught up. Start a new deck below.'}</span>
          </div>
          {totals.due > 0 && <span className="ui-btn ui-btn-primary">Review now <ArrowRight size={15} /></span>}
        </Link>
        <div className="ui-card flash-stat">
          <Brain size={18} />
          <span className="ui-tnum">{totals.mastered}</span>
          <small>cards mastered</small>
        </div>
        <div className="ui-card flash-stat">
          <Flame size={18} />
          <span className="ui-tnum">{totals.seen}</span>
          <small>cards studied</small>
        </div>
        <Link to="/flashcards/mistakes" className={`ui-card flash-stat flash-stat-link${mistakes === 0 ? ' is-muted' : ''}`}>
          <AlertTriangle size={18} />
          <span className="ui-tnum">{mistakes}</span>
          <small>in Mistakes deck</small>
        </Link>
      </section>

      <div className="flash-toolbar">
        <label className="ui-search" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={16} />
          <input className="ui-input" placeholder="Search decks…" value={query} onChange={e => setQuery(e.target.value)} />
        </label>
        <button className={`ui-chip${mineOnly ? ' is-active' : ''}`} onClick={() => setMineOnly(m => !m)}>
          <Heart size={12} /> My events
        </button>
      </div>

      <div className="deck-grid">
        {visible.map(e => {
          const d = decks[e.name];
          const masteredPct = Math.round((d.mastered / d.total) * 100);
          const seenPct = Math.round((d.seen / d.total) * 100);
          return (
            <Link key={e.name} to={`/flashcards/${e.slug}`} className="ui-card ui-card-interactive deck" style={{ ['--ev' as string]: e.color }}>
              <div className="deck-stack" aria-hidden="true"><span /><span /></div>
              <div className="deck-top">
                <span className="deck-icon"><e.icon size={18} /></span>
                {d.due > 0 && <span className="deck-due ui-tnum">{d.due} due</span>}
              </div>
              <h3>{e.name}</h3>
              <p className="deck-meta">{CATEGORY_SHORT[e.category]} · <span className="ui-tnum">{d.total}</span> cards</p>
              <div className="deck-bar" title={`${d.mastered} mastered · ${d.seen} studied`}>
                <span className="deck-bar-seen" style={{ width: `${seenPct}%` }} />
                <span className="deck-bar-mastered" style={{ width: `${masteredPct}%` }} />
              </div>
              <div className="deck-foot">
                <span><b className="ui-tnum">{d.fresh}</b> new</span>
                <span><b className="ui-tnum">{masteredPct}%</b> mastered</span>
              </div>
            </Link>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="ui-empty">
          <div className="ui-empty-icon"><Sparkles size={22} /></div>
          <p>{mineOnly ? 'None of your favorite events have a deck yet.' : 'No decks match that search.'}</p>
        </div>
      )}
    </div>
  );
}
