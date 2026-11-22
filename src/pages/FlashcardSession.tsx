import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Shuffle, PartyPopper, Layers, Settings2, Keyboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { questionService } from '../services/questionService';
import { studyService, previewInterval, type CardState, type Rating } from '../services/studyService';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { EVENTS, eventMeta } from '../lib/events';
import type { Question } from '../data/questionBank';
import './Flashcards.css';

const NEW_PER_SESSION = 20;
const RATINGS: { r: Rating; label: string; key: string }[] = [
  { r: 'again', label: 'Again', key: '1' },
  { r: 'hard', label: 'Hard', key: '2' },
  { r: 'good', label: 'Good', key: '3' },
  { r: 'easy', label: 'Easy', key: '4' },
];

/** MCQs that only make sense with their options get them on the front of the card. */
function needsOptions(q: Question) {
  return q.type === 'MCQ' && /which of the following|which of these|following|all of the above|none of the above|except/i.test(q.question);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardSession() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<Record<string, CardState>>({});
  const [queue, setQueue] = useState<Question[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [subtopic, setSubtopic] = useState('All');
  const [cram, setCram] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [seed, setSeed] = useState(0);

  const deckEvent = EVENTS.find(e => e.slug === slug);
  const deckName = slug === 'due' ? 'All due cards' : slug === 'mistakes' ? 'Mistakes' : deckEvent?.name ?? 'Deck';

  useEffect(() => {
    if (!uid) return;
    Promise.all([questionService.initialize(), studyService.getCards(uid)])
      .then(([, c]) => setCards({ ...c }))
      .finally(() => setReady(true));
    return () => { studyService.flushNow(uid); };
  }, [uid]);

  const pool = useMemo(() => {
    if (!ready) return [] as Question[];
    const all = questionService.getAllQuestions();
    if (slug === 'due' || slug === 'mistakes') return all;
    return all.filter(q => q.event === deckEvent?.name);
  }, [ready, slug, deckEvent]);

  const subtopics = useMemo(() => Array.from(new Set(pool.map(q => q.subtopic).filter(Boolean))).sort(), [pool]);

  // Build the session queue
  useEffect(() => {
    if (!ready) return;
    const now = Date.now();
    let base = pool.filter(q => subtopic === 'All' || q.subtopic === subtopic);
    let q: Question[];
    if (slug === 'mistakes') {
      base = base.filter(x => cards[x.id]?.missed || (cards[x.id]?.lapses ?? 0) > 0);
      q = cram ? shuffle(base) : base.sort((a, b) => (cards[a.id]?.due ?? 0) - (cards[b.id]?.due ?? 0));
    } else if (cram) {
      q = shuffle(base).slice(0, 50);
    } else {
      const due = base
        .filter(x => cards[x.id] && (cards[x.id].reviews > 0 || cards[x.id].missed) && cards[x.id].due <= now)
        .sort((a, b) => cards[a.id].due - cards[b.id].due);
      const fresh = slug === 'due' ? [] : shuffle(base.filter(x => !cards[x.id] || (cards[x.id].reviews === 0 && !cards[x.id].missed))).slice(0, NEW_PER_SESSION);
      q = [...due, ...fresh];
    }
    setQueue(q);
    setPos(0);
    setFlipped(false);
    setTally({ again: 0, hard: 0, good: 0, easy: 0 });
    // cards intentionally excluded: rating shouldn't rebuild the queue mid-session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pool, subtopic, cram, slug, seed]);

  const current = queue[pos];
  const done = ready && pos >= queue.length;

  const rate = useCallback((r: Rating) => {
    if (!current || !flipped) return;
    const next = studyService.rate(uid, current.id, r);
    setCards(c => ({ ...c, [current.id]: next }));
    setTally(t => ({ ...t, [r]: t[r] + 1 }));
    if (r === 'again') setQueue(q => [...q, current]); // see it again this session
    setFlipped(false);
    setPos(p => p + 1);
  }, [current, flipped, uid]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!done) setFlipped(f => !f); }
      const i = ['1', '2', '3', '4'].indexOf(e.key);
      if (i >= 0) rate(RATINGS[i].r);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rate, done]);

  if (!ready) return <PageLoadingScreen loading label="Shuffling cards" />;

  if (!deckEvent && slug !== 'due' && slug !== 'mistakes') {
    return (
      <div className="ui-page"><div className="ui-empty"><h3>Deck not found</h3><Link to="/flashcards" className="ui-btn ui-btn-outline">All decks</Link></div></div>
    );
  }

  const meta = current ? eventMeta(current.event) : deckEvent ?? eventMeta('');
  const total = queue.length;
  const reviewed = Object.values(tally).reduce((a, b) => a + b, 0);

  return (
    <div className="ui-page flash-session" style={{ ['--ev' as string]: meta.color }}>
      <div className="flash-bar">
        <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => navigate('/flashcards')}><ArrowLeft size={15} /> Decks</button>
        <div className="flash-bar-title">
          <span className="flash-bar-name">{deckName}</span>
          <span className="flash-bar-count ui-tnum">{Math.min(pos + (done ? 0 : 1), total)} / {total}</span>
        </div>
        <button className={`ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon${showOptions ? ' is-on' : ''}`} onClick={() => setShowOptions(s => !s)} aria-label="Session options"><Settings2 size={16} /></button>
      </div>
      <div className="ui-progress"><span style={{ width: `${total ? (Math.min(pos, total) / total) * 100 : 0}%` }} /></div>

      {showOptions && (
        <div className="ui-card flash-options">
          {subtopics.length > 1 && slug !== 'due' && (
            <label className="flash-opt">
              <span className="ui-label">Subtopic</span>
              <select className="ui-input" value={subtopic} onChange={e => setSubtopic(e.target.value)}>
                <option>All</option>
                {subtopics.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
          )}
          <label className="toggle-row flash-opt">
            <span>
              <span className="toggle-title">Cram mode</span>
              <span className="toggle-desc">Ignore the schedule, shuffle up to 50 cards</span>
            </span>
            <input type="checkbox" className="ui-switch" checked={cram} onChange={e => setCram(e.target.checked)} />
          </label>
        </div>
      )}

      {done ? (
        <div className="ui-card flash-done">
          <div className="flash-done-icon">{total === 0 ? <Layers size={28} /> : <PartyPopper size={28} />}</div>
          <h2>{total === 0 ? (slug === 'mistakes' ? 'No mistakes to review' : 'Nothing due right now') : 'Session complete'}</h2>
          <p className="ui-muted">
            {total === 0
              ? slug === 'mistakes'
                ? 'Finish a practice test and tap “Make flashcards” to fill this deck with your misses.'
                : 'Come back later, or cram the whole deck now.'
              : `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Missed cards will come back sooner.`}
          </p>
          {reviewed > 0 && (
            <div className="flash-tally">
              {RATINGS.map(x => (
                <div key={x.r} className={`flash-tally-item is-${x.r}`}><b className="ui-tnum">{tally[x.r]}</b><span>{x.label}</span></div>
              ))}
            </div>
          )}
          <div className="flash-done-actions">
            <button className="ui-btn ui-btn-primary" onClick={() => { setCram(true); setSeed(s => s + 1); }}><Shuffle size={15} /> Cram this deck</button>
            {!cram && total > 0 && <button className="ui-btn ui-btn-outline" onClick={() => setSeed(s => s + 1)}><RotateCcw size={15} /> Study more</button>}
            <Link to="/flashcards" className="ui-btn ui-btn-ghost">All decks</Link>
          </div>
        </div>
      ) : current && (
        <>
          <div className="flash-stage">
            <button
              className={`flash-card${flipped ? ' is-flipped' : ''}`}
              onClick={() => setFlipped(f => !f)}
              aria-label={flipped ? 'Show question' : 'Show answer'}
              key={`${current.id}-${pos}`}
            >
              <div className="flash-face flash-front">
                <div className="flash-face-top">
                  <span className="flash-chip"><meta.icon size={13} /> {current.event}</span>
                  {current.subtopic && <span className="flash-sub">{current.subtopic}</span>}
                  {cards[current.id]?.missed && <span className="flash-missed">Missed</span>}
                </div>
                <div className="flash-body">
                  <p className="flash-q">{current.question}</p>
                  {needsOptions(current) && current.options && (
                    <ol className="flash-opts">
                      {current.options.map((o, i) => <li key={i}><b>{String.fromCharCode(65 + i)}</b>{o}</li>)}
                    </ol>
                  )}
                </div>
                <span className="flash-hint">Click or press <kbd className="ui-kbd">Space</kbd> to reveal</span>
              </div>
              <div className="flash-face flash-back">
                <div className="flash-face-top">
                  <span className="flash-chip">Answer</span>
                </div>
                <div className="flash-body">
                  <p className="flash-a">{current.correctAnswer}</p>
                  {current.explanation && <p className="flash-exp">{current.explanation}</p>}
                </div>
                <span className="flash-hint">How well did you know it?</span>
              </div>
            </button>
          </div>

          <div className={`flash-rate${flipped ? ' is-ready' : ''}`}>
            {RATINGS.map(x => (
              <button key={x.r} className={`flash-rate-btn is-${x.r}`} onClick={() => rate(x.r)} disabled={!flipped}>
                <span className="flash-rate-label">{x.label}</span>
                <span className="flash-rate-int">{previewInterval(cards[current.id], x.r)}</span>
                <kbd className="ui-kbd">{x.key}</kbd>
              </button>
            ))}
          </div>
          <p className="flash-keys"><Keyboard size={13} /> <kbd className="ui-kbd">Space</kbd> flip · <kbd className="ui-kbd">1</kbd>–<kbd className="ui-kbd">4</kbd> rate</p>
        </>
      )}
    </div>
  );
}
