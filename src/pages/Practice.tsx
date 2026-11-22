import { useState, useEffect, useMemo } from 'react';
import { Search, Heart, Play, Infinity as InfinityIcon, Handshake, BookOpen, Layers, Minus, Plus, Check, MousePointerClick } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { EVENTS, CATEGORY_SHORT, eventMeta, type EventCategory } from '../lib/events';
import type { Question } from '../data/questionBank';
import { readSavedDivision, resolveDivision, saveDivision, type DivisionSource } from '../lib/division';
import './Practice.css';

type QType = 'mcq' | 'mcq-frq' | 'frq';
type Div = 'b' | 'both' | 'c';
type Diff = 'All' | 'Easy' | 'Medium' | 'Hard';

const COUNT_PRESETS = [5, 10, 20, 40];
const TIME_PRESETS = [5, 10, 25, 50];

export default function Practice() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(location.state?.selectedEvent || null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(10);
  const [questionType, setQuestionType] = useState<QType>('mcq-frq');
  // Start from the remembered division (no flash), then refine from profile/teams/grad year
  const [division, setDivision] = useState<Div>(() => {
    const saved = uid ? readSavedDivision(uid) : null;
    return saved ? (saved.toLowerCase() as Div) : 'both';
  });
  const [divisionSource, setDivisionSource] = useState<DivisionSource | null>(() => (uid && readSavedDivision(uid) ? 'saved' : null));
  const [divisionTouched, setDivisionTouched] = useState(false);
  const [difficulty, setDifficulty] = useState<Diff>('All');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('All Subtopics');
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [category, setCategory] = useState<EventCategory | 'All' | 'Favorites'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    questionService.initialize().then(() => setLoadingQuestions(false));
  }, []);

  useEffect(() => {
    if (!uid) return;
    firestoreService.getProgress(uid)
      .then(prog => setFavorites(prog.favorites ?? []))
      .catch(() => setFavorites(questionService.getProgress().favorites));
    firestoreService.getAnsweredQuestionIds(uid).then(setAnsweredIds).catch(console.error);
  }, [uid]);

  useEffect(() => {
    if (location.state?.selectedEvent) setSelectedEvent(location.state.selectedEvent);
  }, [location.state]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    resolveDivision(uid).then(guess => {
      if (cancelled || !guess || divisionTouched) return;
      setDivision(guess.division.toLowerCase() as Div);
      setDivisionSource(guess.source);
    });
    return () => { cancelled = true; };
    // only on load; a manual pick wins afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const chooseDivision = (d: Div) => {
    setDivisionTouched(true);
    setDivision(d);
    if (d === 'both' || !uid) return;
    setDivisionSource('saved');
    saveDivision(uid, d.toUpperCase() as 'B' | 'C').catch(err => console.warn('Could not save division:', err));
  };

  const allQuestions = useMemo<Question[]>(() => (loadingQuestions ? [] : questionService.getAllQuestions()), [loadingQuestions]);

  const subtopicsMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    allQuestions.forEach(q => {
      (map[q.event] ??= new Set());
      if (q.subtopic) map[q.event].add(q.subtopic);
    });
    const result: Record<string, string[]> = {};
    for (const event in map) result[event] = Array.from(map[event]).sort();
    return result;
  }, [allQuestions]);

  const availableSubtopics = selectedEvent ? subtopicsMap[selectedEvent] || [] : [];

  const passes = (q: Question, ignoreEvent = false, ignoreSubtopic = false) => {
    if (!ignoreEvent && selectedEvent && q.event !== selectedEvent) return false;
    if (!ignoreSubtopic && selectedSubtopic !== 'All Subtopics' && q.subtopic !== selectedSubtopic) return false;
    if (division !== 'both' && q.division !== division.toUpperCase() && q.division !== 'Both') return false;
    if (difficulty !== 'All' && q.difficulty !== difficulty) return false;
    if (questionType === 'mcq' && q.type !== 'MCQ') return false;
    if (questionType === 'frq' && q.type !== 'FRQ') return false;
    if (unansweredOnly && q.id && answeredIds.has(q.id)) return false;
    return true;
  };

  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach(q => { if (passes(q, true, true)) counts[q.event] = (counts[q.event] ?? 0) + 1; });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuestions, division, difficulty, questionType, unansweredOnly, answeredIds]);

  const getSubtopicCount = (subtopic: string): number =>
    allQuestions.filter(q => q.event === selectedEvent && q.subtopic === subtopic && passes(q, false, true)).length;

  const availableCount = useMemo(() => {
    if (!selectedEvent) return 0;
    return allQuestions.filter(q => passes(q)).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent, selectedSubtopic, division, difficulty, questionType, unansweredOnly, answeredIds, allQuestions]);

  const effectiveCount = Math.max(1, Math.min(numQuestions, availableCount || numQuestions));

  if (loadingQuestions) return <PageLoadingScreen loading label="Loading question bank" />;

  const toggleFavorite = async (eventName: string) => {
    const was = favorites.includes(eventName);
    setFavorites(f => (was ? f.filter(x => x !== eventName) : [...f, eventName]));
    try {
      if (uid) await firestoreService.toggleFavorite(uid, eventName);
      else questionService.toggleFavorite(eventName);
      toast(was ? `Removed ${eventName} from your events` : `Added ${eventName} to your events`);
    } catch {
      setFavorites(f => (was ? [...f, eventName] : f.filter(x => x !== eventName)));
      toast('Could not update favorites', 'error');
    }
  };

  const filteredEvents = EVENTS
    .filter(e => {
      if (!e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (category === 'Favorites') return favorites.includes(e.name);
      if (category !== 'All') return e.category === category;
      return true;
    })
    .sort((a, b) => {
      const af = favorites.includes(a.name), bf = favorites.includes(b.name);
      if (af !== bf) return af ? -1 : 1;
      return 0;
    });

  const buildFilter = (unlimited = false) => ({
    event: selectedEvent!,
    subtopic: selectedSubtopic !== 'All Subtopics' ? selectedSubtopic : undefined,
    division: division === 'both' ? 'Both' : (division.toUpperCase() as 'B' | 'C'),
    type: questionType === 'mcq' ? 'MCQ' as const : questionType === 'frq' ? 'FRQ' as const : 'All' as const,
    difficulty: difficulty !== 'All' ? difficulty : undefined,
    ...(unlimited ? {} : { limit: effectiveCount }),
  });

  const ensureReady = () => {
    if (!selectedEvent) { toast('Pick an event first', 'info'); return false; }
    if (availableCount === 0) { toast('No questions match these filters. Try loosening them.', 'error'); return false; }
    return true;
  };

  const persistFilters = (unlimited: boolean) => {
    sessionStorage.setItem('testConfig', JSON.stringify(buildFilter(unlimited)));
    sessionStorage.setItem('unansweredOnly', String(unansweredOnly));
    if (unansweredOnly) sessionStorage.setItem('answeredIds', JSON.stringify([...answeredIds]));
    else sessionStorage.removeItem('answeredIds');
  };

  const handleGenerateTest = () => {
    if (!ensureReady()) return;
    persistFilters(false);
    sessionStorage.setItem('timeLimit', String(timeLimit));
    sessionStorage.removeItem('unlimitedMode');
    navigate('/practice/test');
  };

  const handleUnlimited = () => {
    if (!ensureReady()) return;
    persistFilters(true);
    sessionStorage.setItem('unlimitedMode', 'true');
    navigate('/practice/test');
  };

  const handlePartner = () => {
    if (!ensureReady()) return;
    navigate('/partner', { state: { filter: buildFilter(false), timeLimit } });
  };

  const meta = selectedEvent ? eventMeta(selectedEvent) : null;
  const categories = Object.keys(CATEGORY_SHORT) as EventCategory[];

  return (
    <div className="practice ui-page">
      <header className="ui-page-head">
        <div>
          <span className="ui-eyebrow">2026 events</span>
          <h1>Practice</h1>
          <p>Pick an event, tune the filters and start a timed test or an endless drill.</p>
        </div>
        <div className="practice-div">
          <div className="practice-div-row">
            <span className="ui-label" style={{ margin: 0 }}>Division</span>
            <div className="ui-segment">
              <button className={division === 'b' ? 'is-active' : ''} onClick={() => chooseDivision('b')} title="Division B (middle school)">B</button>
              <button className={division === 'c' ? 'is-active' : ''} onClick={() => chooseDivision('c')} title="Division C (high school)">C</button>
              <button className={division === 'both' ? 'is-active' : ''} onClick={() => chooseDivision('both')} title="Show questions from both divisions">Both</button>
            </div>
          </div>
          <span className="practice-div-hint">
            {division === 'both'
              ? (divisionSource ? 'Showing both divisions for now' : 'Pick B or C and we’ll remember it')
              : divisionSource === 'team' ? 'Set from your team'
              : divisionSource === 'gradYear' ? 'Set from your graduation year'
              : 'Your division · change anytime'}
          </span>
        </div>
      </header>

      <div className="practice-grid">
        {/* Events */}
        <section className="practice-events">
          <div className="practice-toolbar">
            <label className="ui-search practice-search">
              <Search size={16} />
              <input className="ui-input" placeholder="Search events…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} aria-label="Search events" />
            </label>
            <div className="practice-cats">
              <button className={`ui-chip${category === 'All' ? ' is-active' : ''}`} onClick={() => setCategory('All')}>All</button>
              <button className={`ui-chip${category === 'Favorites' ? ' is-active' : ''}`} onClick={() => setCategory('Favorites')}>
                <Heart size={12} /> Mine {favorites.length > 0 && <span className="ui-tnum">{favorites.length}</span>}
              </button>
              {categories.map(c => (
                <button key={c} className={`ui-chip${category === c ? ' is-active' : ''}`} onClick={() => setCategory(c)}>{CATEGORY_SHORT[c]}</button>
              ))}
            </div>
          </div>

          <div className="event-tiles">
            {filteredEvents.map(e => {
              const isFav = favorites.includes(e.name);
              const count = eventCounts[e.name] ?? 0;
              const selected = selectedEvent === e.name;
              return (
                <div
                  key={e.name}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  className={`event-tile${selected ? ' is-selected' : ''}${count === 0 ? ' is-empty' : ''}`}
                  style={{ ['--ev' as string]: e.color }}
                  onClick={() => { setSelectedEvent(e.name); setSelectedSubtopic('All Subtopics'); }}
                  onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setSelectedEvent(e.name); setSelectedSubtopic('All Subtopics'); } }}
                >
                  <span className="event-tile-icon"><e.icon size={18} /></span>
                  <span className="event-tile-body">
                    <span className="event-tile-name">{e.name}</span>
                    <span className="event-tile-meta">{CATEGORY_SHORT[e.category]} · <b className="ui-tnum">{count}</b> Q</span>
                  </span>
                  <button
                    className={`event-tile-fav${isFav ? ' is-on' : ''}`}
                    aria-label={isFav ? `Unfavorite ${e.name}` : `Favorite ${e.name}`}
                    onClick={ev => { ev.stopPropagation(); toggleFavorite(e.name); }}
                  >
                    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                  {selected && <span className="event-tile-check"><Check size={12} /></span>}
                </div>
              );
            })}
            {filteredEvents.length === 0 && (
              <div className="ui-empty" style={{ gridColumn: '1 / -1' }}>
                <p>{category === 'Favorites' ? 'No favorite events yet. Tap the heart on any event.' : 'No events match your search.'}</p>
              </div>
            )}
          </div>
        </section>

        {/* Config */}
        <aside className="practice-config ui-card">
          {meta ? (
            <div className="config-event" style={{ ['--ev' as string]: meta.color }}>
              <span className="config-event-icon"><meta.icon size={20} /></span>
              <div className="config-event-body">
                <span className="config-event-name">{meta.name}</span>
                <span className="config-event-meta">{CATEGORY_SHORT[meta.category]} · {meta.kind}</span>
              </div>
              <div className="config-event-links">
                {meta.wikiId && <Link to={`/wiki/${meta.wikiId}`} className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" title="Open wiki"><BookOpen size={15} /></Link>}
                {meta.kind !== 'Build' && <Link to={`/flashcards/${meta.slug}`} className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" title="Flashcards"><Layers size={15} /></Link>}
              </div>
            </div>
          ) : (
            <div className="config-placeholder">
              <MousePointerClick size={20} />
              <span>Select an event to configure your session</span>
            </div>
          )}

          <div className="config-body">
            <div className="config-field">
              <div className="config-label-row">
                <span className="ui-label">Questions</span>
                {selectedEvent && <span className="config-hint ui-tnum">{availableCount} available</span>}
              </div>
              <div className="config-stepper-row">
                <div className="stepper">
                  <button aria-label="Fewer" onClick={() => setNumQuestions(n => Math.max(1, n - 1))}><Minus size={14} /></button>
                  <input
                    type="number"
                    min={1}
                    value={numQuestions}
                    onChange={e => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    aria-label="Number of questions"
                  />
                  <button aria-label="More" onClick={() => setNumQuestions(n => n + 1)}><Plus size={14} /></button>
                </div>
                <div className="preset-row">
                  {COUNT_PRESETS.map(p => (
                    <button key={p} className={`preset${numQuestions === p ? ' is-active' : ''}`} onClick={() => setNumQuestions(p)}>{p}</button>
                  ))}
                </div>
              </div>
              {selectedEvent && numQuestions > availableCount && availableCount > 0 && (
                <span className="config-warn">Only {availableCount} match. The test will use all of them.</span>
              )}
            </div>

            <div className="config-field">
              <span className="ui-label">Time limit (minutes)</span>
              <div className="config-stepper-row">
                <div className="stepper">
                  <button aria-label="Less time" onClick={() => setTimeLimit(t => Math.max(1, t - 1))}><Minus size={14} /></button>
                  <input type="number" min={1} value={timeLimit} onChange={e => setTimeLimit(Math.max(1, parseInt(e.target.value, 10) || 1))} aria-label="Time limit in minutes" />
                  <button aria-label="More time" onClick={() => setTimeLimit(t => t + 1)}><Plus size={14} /></button>
                </div>
                <div className="preset-row">
                  {TIME_PRESETS.map(p => (
                    <button key={p} className={`preset${timeLimit === p ? ' is-active' : ''}`} onClick={() => setTimeLimit(p)}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="config-field">
              <span className="ui-label">Question type</span>
              <div className="ui-segment config-segment">
                <button className={questionType === 'mcq' ? 'is-active' : ''} onClick={() => setQuestionType('mcq')}>Multiple choice</button>
                <button className={questionType === 'mcq-frq' ? 'is-active' : ''} onClick={() => setQuestionType('mcq-frq')}>Mixed</button>
                <button className={questionType === 'frq' ? 'is-active' : ''} onClick={() => setQuestionType('frq')}>Free response</button>
              </div>
            </div>

            <div className="config-field">
              <span className="ui-label">Difficulty</span>
              <div className="ui-segment config-segment">
                {(['All', 'Easy', 'Medium', 'Hard'] as Diff[]).map(d => (
                  <button key={d} className={difficulty === d ? 'is-active' : ''} onClick={() => setDifficulty(d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="config-field">
              <label className="ui-label" htmlFor="subtopic">Subtopic</label>
              <select id="subtopic" className="ui-input" value={selectedSubtopic} onChange={e => setSelectedSubtopic(e.target.value)} disabled={!selectedEvent}>
                <option>All Subtopics</option>
                {availableSubtopics.map(s => (
                  <option key={s} value={s}>{s} ({getSubtopicCount(s)})</option>
                ))}
              </select>
            </div>

            <label className="toggle-row">
              <span>
                <span className="toggle-title">Only unanswered</span>
                <span className="toggle-desc">Skip questions you’ve already seen</span>
              </span>
              <input type="checkbox" className="ui-switch" checked={unansweredOnly} onChange={e => setUnansweredOnly(e.target.checked)} />
            </label>
          </div>

          <div className="config-actions-v2">
            <button className="ui-btn ui-btn-primary ui-btn-lg" onClick={handleGenerateTest} disabled={!selectedEvent}>
              <Play size={16} /> Start {selectedEvent ? `${effectiveCount}-question test` : 'test'}
            </button>
            <div className="config-actions-row">
              <button className="ui-btn ui-btn-outline" onClick={handleUnlimited} disabled={!selectedEvent}>
                <InfinityIcon size={16} /> Endless drill
              </button>
              <button className="ui-btn ui-btn-outline" onClick={handlePartner} disabled={!selectedEvent}>
                <Handshake size={16} /> With partner
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
