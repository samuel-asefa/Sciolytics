import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Search, Star, ArrowRight, CheckCircle2, FileText, PlusSquare, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type CustomTest, type RatingSummary, isAdmin } from '../services/firestoreService';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { EVENTS, eventMeta } from '../lib/events';
import type { Timestamp } from 'firebase/firestore';
import { primaryEvent, primaryDivision } from '../lib/testMeta';
import './Community.css';

type Sort = 'top' | 'new' | 'size';

function Stars({ value, mine, onRate, disabled }: { value: number; mine?: number; onRate?: (n: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  const shown = hover || mine || 0;
  return (
    <div className="stars" onMouseLeave={() => setHover(0)} role={onRate ? 'radiogroup' : undefined} aria-label="Rate this test">
      {[1, 2, 3, 4, 5].map(n => {
        const fill = shown ? n <= shown : n <= Math.round(value);
        return (
          <button
            key={n}
            className={`star${fill ? ' is-on' : ''}${shown ? ' is-mine' : ''}`}
            disabled={disabled || !onRate}
            onMouseEnter={() => setHover(n)}
            onClick={e => { e.stopPropagation(); onRate?.(n); }}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            role={onRate ? 'radio' : undefined}
            aria-checked={mine === n}
          >
            <Star size={15} fill={fill ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const [tests, setTests] = useState<CustomTest[]>([]);
  const [ratings, setRatings] = useState<Record<string, RatingSummary>>({});
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('All');
  const [divFilter, setDivFilter] = useState<'All' | 'B' | 'C'>('All');
  const [sort, setSort] = useState<Sort>('top');

  const isUserAdmin = isAdmin(currentUser);

  useEffect(() => {
    Promise.all([
      firestoreService.getPublicCustomTests(),
      firestoreService.getRatingSummaries(currentUser?.uid).catch(err => { console.warn('Ratings unavailable:', err); return {}; }),
    ])
      .then(([t, r]) => { setTests(t.filter(x => x.questions?.length)); setRatings(r); })
      .catch(err => { console.error(err); toast('Could not load community tests', 'error'); })
      .finally(() => setLoading(false));
  }, [currentUser?.uid, toast]);

  const enriched = useMemo(() => tests.map(t => ({ t, event: primaryEvent(t), division: primaryDivision(t) })), [tests]);

  const eventOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    enriched.forEach(e => { counts[e.event] = (counts[e.event] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [enriched]);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    const score = (id?: string) => {
      const r = id ? ratings[id] : undefined;
      if (!r) return 0;
      // Bayesian-ish: pull low-count averages toward 3
      return (r.avg * r.count + 3 * 2) / (r.count + 2);
    };
    return enriched
      .filter(({ t, event, division }) =>
        (eventFilter === 'All' || event === eventFilter) &&
        (divFilter === 'All' || division === divFilter || division === 'Both') &&
        (!q || t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q) || event.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (sort === 'top') return score(b.t.id) - score(a.t.id);
        if (sort === 'size') return b.t.questions.length - a.t.questions.length;
        const ta = (a.t.createdAt as Timestamp)?.toMillis?.() ?? 0;
        const tb = (b.t.createdAt as Timestamp)?.toMillis?.() ?? 0;
        return tb - ta;
      });
  }, [enriched, eventFilter, divFilter, query, sort, ratings]);

  const rate = async (t: CustomTest, stars: number) => {
    if (!currentUser || !t.id) return;
    if (t.creatorId === currentUser.uid) { toast('You can’t rate your own test', 'info'); return; }
    const prev = ratings[t.id];
    const count = prev ? prev.count + (prev.mine ? 0 : 1) : 1;
    const sum = prev ? prev.avg * prev.count - (prev.mine ?? 0) + stars : stars;
    setRatings(r => ({ ...r, [t.id!]: { avg: sum / count, count, mine: stars } }));
    try {
      await firestoreService.rateCustomTest(t.id, currentUser.uid, stars);
      toast(`Rated ${stars} star${stars === 1 ? '' : 's'}`);
    } catch (err) {
      console.error(err);
      setRatings(r => ({ ...r, [t.id!]: prev }));
      toast('Rating failed. Firestore rules may need deploying.', 'error');
    }
  };

  const handlePublish = async (test: CustomTest) => {
    if (!isUserAdmin) return;
    if (!confirm(`Publish the questions from “${test.title}” to the official question bank?`)) return;
    setPublishingId(test.id || null);
    try {
      await firestoreService.publishQuestionsToBank(test);
      toast('Published to the official question bank');
    } catch (err) {
      console.error(err);
      toast('Publish failed. Check admin rights.', 'error');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) return <PageLoadingScreen loading label="Loading community tests" />;

  return (
    <div className="ui-page community">
      <header className="ui-page-head">
        <div>
          <span className="ui-eyebrow"><Globe size={13} /> Community</span>
          <h1>Community tests</h1>
          <p>Tests written and shared by Science Olympiad competitors. Rate the ones that helped so the best rise to the top.</p>
        </div>
        <Link to="/create" className="ui-btn ui-btn-outline"><PlusSquare size={16} /> Share a test</Link>
      </header>

      <div className="community-toolbar ui-card">
        <label className="ui-search community-search">
          <Search size={16} />
          <input className="ui-input" placeholder="Search tests…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search tests" />
        </label>
        <select className="ui-input community-select" value={eventFilter} onChange={e => setEventFilter(e.target.value)} aria-label="Filter by event">
          <option value="All">All events</option>
          {eventOptions.map(([ev, n]) => <option key={ev} value={ev}>{ev} ({n})</option>)}
        </select>
        <div className="ui-segment" aria-label="Division">
          {(['All', 'B', 'C'] as const).map(d => (
            <button key={d} className={divFilter === d ? 'is-active' : ''} onClick={() => setDivFilter(d)}>{d === 'All' ? 'All div.' : `Div ${d}`}</button>
          ))}
        </div>
        <div className="community-sort">
          <SlidersHorizontal size={14} />
          <select className="ui-input" value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort">
            <option value="top">Top rated</option>
            <option value="new">Newest</option>
            <option value="size">Most questions</option>
          </select>
        </div>
      </div>

      {eventOptions.length > 1 && (
        <div className="community-chips">
          <button className={`ui-chip${eventFilter === 'All' ? ' is-active' : ''}`} onClick={() => setEventFilter('All')}>All</button>
          {eventOptions.slice(0, 10).map(([ev]) => {
            const m = eventMeta(ev);
            return (
              <button key={ev} className={`ui-chip${eventFilter === ev ? ' is-active' : ''}`} onClick={() => setEventFilter(ev)}>
                {EVENTS.some(e => e.name === ev) && <m.icon size={12} />} {ev}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="ui-card ui-empty">
          <div className="ui-empty-icon"><Globe size={24} /></div>
          <h3>{tests.length === 0 ? 'No community tests yet' : 'No tests match these filters'}</h3>
          <p>{tests.length === 0 ? 'Be the first! Build a test in Create and switch it to public.' : 'Try another event or clear the search.'}</p>
          {tests.length === 0 && <Link to="/create" className="ui-btn ui-btn-primary">Create a test</Link>}
        </div>
      ) : (
        <div className="community-grid">
          {visible.map(({ t, event, division }) => {
            const m = eventMeta(event);
            const r = t.id ? ratings[t.id] : undefined;
            const mcq = t.questions.filter(q => q.type === 'MCQ').length;
            const isMine = t.creatorId === currentUser?.uid;
            return (
              <article key={t.id} className="ui-card ctest" style={{ ['--ev' as string]: m.color }}>
                <div className="ctest-top">
                  <span className="ctest-event"><m.icon size={13} /> {event}</span>
                  {isMine && <span className="ui-chip ui-chip-primary">Yours</span>}
                </div>
                <h3>{t.title || 'Untitled test'}</h3>
                <p className="ctest-desc">{t.description || 'No description provided.'}</p>
                <div className="ctest-meta">
                  <span><FileText size={13} /> {t.questions.length} Qs</span>
                  <span>{mcq} MCQ · {t.questions.length - mcq} FRQ</span>
                  <span>Div {division}</span>
                </div>
                <div className="ctest-rating">
                  <Stars value={r?.avg ?? 0} mine={r?.mine} onRate={isMine ? undefined : n => rate(t, n)} />
                  <span className="ctest-rating-text ui-tnum">{r ? `${r.avg.toFixed(1)} · ${r.count} rating${r.count === 1 ? '' : 's'}` : 'No ratings yet'}</span>
                </div>
                <div className="ctest-actions">
                  <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => navigate(`/test/${t.id}`)}>Take test <ArrowRight size={14} /></button>
                  {isUserAdmin && (
                    <button className="ui-btn ui-btn-soft ui-btn-sm" onClick={() => handlePublish(t)} disabled={publishingId === t.id} title="Approve & publish to the official bank">
                      <CheckCircle2 size={14} /> {publishingId === t.id ? 'Publishing…' : 'Approve'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
