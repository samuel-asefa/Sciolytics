import { useMemo, useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { RotateCcw, Layers, LayoutDashboard, CheckCircle2, XCircle, MinusCircle, Clock, ChevronDown, PenTool, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { studyService } from '../services/studyService';
import { useToast } from '../components/Toast';
import type { ReviewItem } from '../components/TestRunner';
import './PracticeResults.css';

interface ResultsState {
  review?: ReviewItem[];
  elapsedSec?: number;
  title?: string;
  source?: 'practice' | 'custom' | 'partner';
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 2.2 + Math.random() * 1.6,
    rot: Math.random() * 360,
    color: ['#1f6feb', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ffd166'][i % 6],
    w: 6 + Math.random() * 6,
  })), []);
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, background: p.color, width: p.w, height: p.w * 0.45, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  );
}

export default function PracticeResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { currentUser } = useAuth();
  const state = (location.state || {}) as ResultsState;
  const review = state.review;
  const [filter, setFilter] = useState<'all' | 'wrong' | 'skipped'>('all');
  const [open, setOpen] = useState<number | null>(null);

  const stats = useMemo(() => {
    if (!review) return null;
    const correct = review.filter(r => r.isCorrect === true).length;
    const wrong = review.filter(r => r.isCorrect === false).length;
    const skipped = review.filter(r => r.isCorrect === null).length;
    const attempted = correct + wrong;
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
    const bySub: Record<string, { c: number; t: number }> = {};
    review.forEach(r => {
      if (r.isCorrect === null) return;
      const k = r.question.subtopic || 'General';
      (bySub[k] ??= { c: 0, t: 0 });
      bySub[k].t += 1;
      if (r.isCorrect) bySub[k].c += 1;
    });
    const subtopics = Object.entries(bySub)
      .map(([name, s]) => ({ name, ...s, pct: Math.round((s.c / s.t) * 100) }))
      .sort((a, b) => a.pct - b.pct);
    return { correct, wrong, skipped, attempted, accuracy, subtopics };
  }, [review]);

  if (!review || !stats) return <Navigate to="/practice" replace />;

  const missed = review.filter(r => r.isCorrect !== true).map(r => r.question);
  const headline =
    stats.attempted === 0 ? 'No answers recorded' :
    stats.accuracy >= 90 ? 'Outstanding.' :
    stats.accuracy >= 75 ? 'Strong work.' :
    stats.accuracy >= 50 ? 'Getting there.' : 'Good reps. Now review.';

  const fmt = (s = 0) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

  const retryMissed = () => {
    sessionStorage.setItem('testConfig', JSON.stringify({ ids: missed.map(q => q.id) }));
    sessionStorage.setItem('timeLimit', String(Math.max(3, missed.length)));
    sessionStorage.removeItem('unlimitedMode');
    sessionStorage.setItem('unansweredOnly', 'false');
    navigate('/practice/test');
  };

  const toFlashcards = async () => {
    if (!currentUser) return;
    try {
      await studyService.markMissed(currentUser.uid, missed.map(q => q.id));
      toast(`${missed.length} card${missed.length === 1 ? '' : 's'} added to your Mistakes deck`);
      navigate('/flashcards/mistakes');
    } catch {
      toast('Could not create flashcards', 'error');
    }
  };

  const r = 64;
  const c = 2 * Math.PI * r;
  const visible = review
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => filter === 'all' || (filter === 'wrong' ? item.isCorrect === false : item.isCorrect === null));

  return (
    <div className="results ui-page">
      {stats.accuracy >= 80 && stats.attempted >= 3 && <Confetti />}

      <section className="ui-card results-hero">
        <div className="results-ring">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={r} fill="none" stroke="var(--bg-gray)" strokeWidth="12" />
            <circle
              cx="80" cy="80" r={r} fill="none" strokeWidth="12" strokeLinecap="round"
              stroke={stats.accuracy >= 75 ? 'var(--success)' : stats.accuracy >= 50 ? 'var(--warning)' : 'var(--danger)'}
              strokeDasharray={c} strokeDashoffset={c * (1 - stats.accuracy / 100)}
              transform="rotate(-90 80 80)" className="results-ring-arc"
            />
          </svg>
          <div className="results-ring-center">
            <b className="ui-tnum">{stats.accuracy}%</b>
            <span>accuracy</span>
          </div>
        </div>
        <div className="results-summary">
          <span className="ui-eyebrow"><Trophy size={13} /> {state.title ?? 'Practice test'}</span>
          <h1>{headline}</h1>
          <p className="ui-muted">You got {stats.correct} of {review.length} questions right{stats.skipped ? `, with ${stats.skipped} skipped` : ''}.</p>
          <div className="results-chips">
            <span className="ui-chip ui-chip-success"><CheckCircle2 size={13} /> {stats.correct} correct</span>
            <span className="ui-chip ui-chip-danger"><XCircle size={13} /> {stats.wrong} incorrect</span>
            {stats.skipped > 0 && <span className="ui-chip"><MinusCircle size={13} /> {stats.skipped} skipped</span>}
            {state.elapsedSec ? <span className="ui-chip"><Clock size={13} /> {fmt(state.elapsedSec)}</span> : null}
          </div>
          <div className="results-actions">
            {missed.length > 0 && <button className="ui-btn ui-btn-primary" onClick={retryMissed}><RotateCcw size={15} /> Retry {missed.length} missed</button>}
            {missed.length > 0 && <button className="ui-btn ui-btn-outline" onClick={toFlashcards}><Layers size={15} /> Make flashcards</button>}
            <Link to="/practice" className="ui-btn ui-btn-ghost"><PenTool size={15} /> New test</Link>
            <Link to="/dashboard" className="ui-btn ui-btn-ghost"><LayoutDashboard size={15} /> Dashboard</Link>
          </div>
        </div>
      </section>

      {stats.subtopics.length > 1 && (
        <section className="ui-card ui-card-pad">
          <h2 className="results-h2">By subtopic</h2>
          <div className="results-subs">
            {stats.subtopics.map(s => (
              <div key={s.name} className="results-sub">
                <span className="results-sub-name">{s.name}</span>
                <div className="ui-progress"><span style={{ width: `${s.pct}%`, background: s.pct >= 75 ? 'var(--success)' : s.pct >= 50 ? 'var(--warning)' : 'var(--danger)' }} /></div>
                <span className="results-sub-pct ui-tnum">{s.c}/{s.t}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="results-review-head">
          <h2 className="results-h2">Review</h2>
          <div className="ui-segment">
            <button className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>All {review.length}</button>
            <button className={filter === 'wrong' ? 'is-active' : ''} onClick={() => setFilter('wrong')}>Incorrect {stats.wrong}</button>
            <button className={filter === 'skipped' ? 'is-active' : ''} onClick={() => setFilter('skipped')}>Skipped {stats.skipped}</button>
          </div>
        </div>
        <div className="review-list">
          {visible.map(({ item, i }) => {
            const q = item.question;
            const isOpen = open === i;
            return (
              <div key={i} className={`ui-card review-item${isOpen ? ' is-open' : ''}`}>
                <button className="review-row" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className={`review-status ${item.isCorrect === true ? 'ok' : item.isCorrect === false ? 'bad' : 'skip'}`}>
                    {item.isCorrect === true ? <CheckCircle2 size={16} /> : item.isCorrect === false ? <XCircle size={16} /> : <MinusCircle size={16} />}
                  </span>
                  <span className="review-num ui-tnum">{i + 1}</span>
                  <span className="review-q">{q.question}</span>
                  <ChevronDown size={16} className="review-chev" />
                </button>
                {isOpen && (
                  <div className="review-body">
                    {q.type === 'MCQ' && q.options && (
                      <ul className="review-opts">
                        {q.options.map((o, oi) => (
                          <li key={oi} className={`${o === q.correctAnswer ? 'is-right' : ''} ${o === item.answer && o !== q.correctAnswer ? 'is-wrong' : ''}`}>
                            <b>{String.fromCharCode(65 + oi)}</b> {o}
                            {o === item.answer && <em>your answer</em>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.type === 'FRQ' && (
                      <>
                        <div className="review-block"><h4>Your answer</h4><p>{item.answer || 'No answer'}</p></div>
                        <div className="review-block"><h4>Answer key</h4><p>{q.correctAnswer}</p></div>
                      </>
                    )}
                    {item.feedback && <div className="review-block is-ai"><h4>AI feedback</h4><p>{item.feedback}</p></div>}
                    {q.explanation && <div className="review-block"><h4>Explanation</h4><p>{q.explanation}</p></div>}
                  </div>
                )}
              </div>
            );
          })}
          {visible.length === 0 && <div className="ui-empty"><p>Nothing here. Nice.</p></div>}
        </div>
      </section>
    </div>
  );
}
