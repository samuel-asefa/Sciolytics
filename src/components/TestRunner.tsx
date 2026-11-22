import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Bookmark, Loader2, Flag, Sparkles, X, Keyboard,
} from 'lucide-react';
import type { Question } from '../data/questionBank';
import { aiGradingService } from '../services/aiGradingService';
import { aiTutorService } from '../services/aiTutorService';
import { eventMeta } from '../lib/events';
import '../styles/test-runner.css';

export interface ReviewItem {
  question: Question;
  answer: string;
  isCorrect: boolean | null; // null = skipped
  feedback?: string;
}

interface TestRunnerProps {
  questions: Question[];
  title: string;
  /** seconds; null/0 → untimed */
  timeLimitSec?: number | null;
  onAnswer?: (q: Question, isCorrect: boolean) => void;
  onFinish: (review: ReviewItem[], meta: { elapsedSec: number }) => void;
  onExit?: () => void;
  bookmarkedIds?: Set<string>;
  onToggleBookmark?: (q: Question) => void;
}

interface AnswerState { answer: string; isCorrect: boolean; feedback?: string; aiExplain?: string }

export default function TestRunner({
  questions, title, timeLimitSec, onAnswer, onFinish, onExit, bookmarkedIds, onToggleBookmark,
}: TestRunnerProps) {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [grading, setGrading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [remaining, setRemaining] = useState<number>(timeLimitSec || 0);
  const [showKeys, setShowKeys] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const startedAt = useRef(Date.now());
  const finishedRef = useRef(false);

  const q = questions[index];
  const state = answers[index];
  const selected = state?.answer ?? draft[index] ?? '';
  const timed = !!timeLimitSec;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const meta = eventMeta(q?.event ?? '');

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const review: ReviewItem[] = questions.map((question, i) => ({
      question,
      answer: answers[i]?.answer ?? draft[i] ?? '',
      isCorrect: answers[i] ? answers[i].isCorrect : null,
      feedback: answers[i]?.feedback ?? answers[i]?.aiExplain,
    }));
    onFinish(review, { elapsedSec: Math.round((Date.now() - startedAt.current) / 1000) });
  }, [answers, draft, questions, onFinish]);

  // Timer
  useEffect(() => {
    if (!timed) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [timed]);

  useEffect(() => {
    if (timed && remaining === 0) finish();
  }, [timed, remaining, finish]);

  const submit = useCallback(async () => {
    if (!q || state || grading) return;
    const answer = draft[index] ?? '';
    if (q.type === 'MCQ' && !answer) return;
    let isCorrect = false;
    let feedback: string | undefined;
    if (q.type === 'MCQ') {
      isCorrect = answer === q.correctAnswer;
    } else {
      setGrading(true);
      try {
        const g = await aiGradingService.gradeFRQ(q.question, q.correctAnswer, q.explanation || '', answer);
        isCorrect = g.isCorrect;
        feedback = g.feedback;
      } finally {
        setGrading(false);
      }
    }
    setAnswers(a => ({ ...a, [index]: { answer, isCorrect, feedback } }));
    onAnswer?.(q, isCorrect);
  }, [q, state, grading, draft, index, onAnswer]);

  const go = useCallback((i: number) => {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
  }, [questions.length]);

  const next = useCallback(() => {
    if (index < questions.length - 1) go(index + 1);
    else finish();
  }, [index, questions.length, go, finish]);

  const choose = useCallback((opt: string) => {
    if (state) return;
    setDraft(d => ({ ...d, [index]: opt }));
  }, [state, index]);

  const explain = async () => {
    if (!q || !state || state.isCorrect || q.type !== 'MCQ') return;
    setExplaining(true);
    try {
      const text = await aiTutorService.explainMistake(q, state.answer);
      setAnswers(a => ({ ...a, [index]: { ...a[index], aiExplain: text } }));
    } catch {
      setAnswers(a => ({ ...a, [index]: { ...a[index], aiExplain: 'The AI tutor is unavailable right now. Check the explanation above.' } }));
    } finally {
      setExplaining(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === 'TEXTAREA' || t.tagName === 'INPUT';
      if (typing) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (state) next(); else submit(); }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (q?.type === 'MCQ' && q.options && !state) {
        const n = '123456'.indexOf(k);
        const l = 'abcdef'.indexOf(k);
        const i = n >= 0 ? n : l;
        if (i >= 0 && i < q.options.length) { choose(q.options[i]); return; }
      }
      if (e.key === 'Enter') { e.preventDefault(); if (state) next(); else submit(); }
      else if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (k === 'm' && onToggleBookmark && q) onToggleBookmark(q);
      else if (k === '?') setShowKeys(s => !s);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, state, choose, submit, next, go, index, onToggleBookmark]);

  // Warn before leaving mid-test
  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => {
      if (!finishedRef.current && answeredCount > 0) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [answeredCount]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pct = useMemo(() => (questions.length ? (answeredCount / questions.length) * 100 : 0), [answeredCount, questions.length]);

  if (!q) return null;
  const isBookmarked = bookmarkedIds?.has(q.id) ?? false;
  const lowTime = timed && remaining <= 60;

  return (
    <div className="runner" style={{ ['--ev' as string]: meta.color }}>
      {/* Top bar */}
      <div className="runner-bar">
        <div className="runner-bar-left">
          <span className="runner-event-icon"><meta.icon size={17} /></span>
          <div className="runner-titles">
            <span className="runner-title">{title}</span>
            <span className="runner-sub ui-tnum">Question {index + 1} of {questions.length} · {correctCount}/{answeredCount} correct</span>
          </div>
        </div>
        <div className="runner-bar-right">
          {timed && (
            <span className={`runner-timer ui-tnum${lowTime ? ' is-low' : ''}`} aria-live={lowTime ? 'polite' : 'off'}>
              <Clock size={15} /> {fmt(remaining)}
            </span>
          )}
          <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" title="Keyboard shortcuts (?)" onClick={() => setShowKeys(s => !s)}><Keyboard size={16} /></button>
          <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => setConfirmEnd(true)}><Flag size={14} /> Finish</button>
        </div>
      </div>
      <div className="ui-progress runner-progress"><span style={{ width: `${pct}%` }} /></div>

      {/* Navigator */}
      {questions.length <= 60 && (
        <div className="runner-nav" role="tablist" aria-label="Questions">
          {questions.map((_, i) => {
            const a = answers[i];
            return (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Question ${i + 1}${a ? (a.isCorrect ? ', correct' : ', incorrect') : ''}`}
                className={`runner-dot${i === index ? ' is-current' : ''}${a ? (a.isCorrect ? ' is-right' : ' is-wrong') : draft[i] ? ' is-draft' : ''}`}
                onClick={() => go(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Question */}
      <article className="ui-card runner-card" key={index}>
        <div className="runner-q-head">
          <div className="runner-tags">
            <span className="ui-chip ui-chip-primary">{q.type === 'MCQ' ? 'Multiple choice' : 'Free response'}</span>
            <span className={`ui-chip ${q.difficulty === 'Hard' ? 'ui-chip-danger' : q.difficulty === 'Easy' ? 'ui-chip-success' : 'ui-chip-warning'}`}>{q.difficulty}</span>
            {q.subtopic && <span className="ui-chip">{q.subtopic}</span>}
            {q.tournament && <span className="runner-source">{q.tournament}{q.year ? ` · ${q.year}` : ''}</span>}
          </div>
          {onToggleBookmark && (
            <button
              className={`runner-bookmark${isBookmarked ? ' is-on' : ''}`}
              onClick={() => onToggleBookmark(q)}
              title={isBookmarked ? 'Remove bookmark (M)' : 'Bookmark (M)'}
              aria-pressed={isBookmarked}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <h2 className="runner-question">{q.question}</h2>

        {q.type === 'MCQ' && q.options && (
          <div className="runner-options" role="radiogroup">
            {q.options.map((opt, i) => {
              const isSel = selected === opt;
              const isRight = !!state && opt === q.correctAnswer;
              const isWrong = !!state && isSel && opt !== q.correctAnswer;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={isSel}
                  className={`option-button runner-option${isSel ? ' selected' : ''}${isRight ? ' correct' : ''}${isWrong ? ' wrong' : ''}${state && !isRight && !isWrong ? ' is-dim' : ''}`}
                  onClick={() => choose(opt)}
                  disabled={!!state}
                >
                  <span className="runner-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="runner-option-text">{opt}</span>
                  {isRight && <CheckCircle2 size={20} className="runner-ico-right" />}
                  {isWrong && <XCircle size={20} className="runner-ico-wrong" />}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'FRQ' && (
          <div className="runner-frq">
            <textarea
              className="ui-input"
              value={selected}
              onChange={e => setDraft(d => ({ ...d, [index]: e.target.value }))}
              placeholder="Type your answer… (⌘/Ctrl + Enter to submit)"
              rows={6}
              disabled={!!state || grading}
              autoFocus
            />
            {state && (
              <div className={`runner-verdict ${state.isCorrect ? 'is-right' : 'is-wrong'}`}>
                {state.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {state.isCorrect ? 'Marked correct' : 'Marked incorrect'}
              </div>
            )}
            {state && (
              <div className="runner-panel">
                <h4>Answer key</h4>
                <p>{q.correctAnswer}</p>
              </div>
            )}
            {state?.feedback && (
              <div className="runner-panel is-ai">
                <h4><Sparkles size={14} /> AI feedback</h4>
                <p>{state.feedback}</p>
              </div>
            )}
          </div>
        )}

        {state && q.explanation && (
          <div className="runner-panel">
            <h4>Explanation</h4>
            <p>{q.explanation}</p>
          </div>
        )}

        {state && !state.isCorrect && q.type === 'MCQ' && (
          state.aiExplain ? (
            <div className="runner-panel is-ai">
              <h4><Sparkles size={14} /> AI tutor</h4>
              <p>{state.aiExplain}</p>
            </div>
          ) : (
            <button className="ui-btn ui-btn-soft ui-btn-sm runner-explain" onClick={explain} disabled={explaining}>
              {explaining ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              {explaining ? 'Thinking…' : 'Explain my mistake'}
            </button>
          )
        )}

        <div className="runner-actions">
          <button className="ui-btn ui-btn-ghost" onClick={() => go(index - 1)} disabled={index === 0 || grading}>
            <ArrowLeft size={16} /> Previous
          </button>
          <div className="runner-actions-right">
            {!state && (
              <button className="ui-btn ui-btn-ghost" onClick={next} disabled={grading}>Skip</button>
            )}
            {!state ? (
              <button className="ui-btn ui-btn-primary" onClick={submit} disabled={(q.type === 'MCQ' && !selected) || grading}>
                {grading ? <><Loader2 size={16} className="spin" /> Grading…</> : <>Check answer <kbd className="runner-kbd">↵</kbd></>}
              </button>
            ) : (
              <button className="ui-btn ui-btn-primary" onClick={next}>
                {index < questions.length - 1 ? <>Next <ArrowRight size={16} /></> : <>See results <ArrowRight size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </article>

      {showKeys && (
        <div className="runner-keys ui-card">
          <div className="runner-keys-head"><b>Keyboard shortcuts</b><button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" onClick={() => setShowKeys(false)} aria-label="Close"><X size={14} /></button></div>
          <ul>
            <li><span><kbd className="ui-kbd">A</kbd>–<kbd className="ui-kbd">D</kbd> or <kbd className="ui-kbd">1</kbd>–<kbd className="ui-kbd">4</kbd></span> pick an answer</li>
            <li><span><kbd className="ui-kbd">↵</kbd></span> check / next</li>
            <li><span><kbd className="ui-kbd">←</kbd> <kbd className="ui-kbd">→</kbd></span> previous / next question</li>
            <li><span><kbd className="ui-kbd">M</kbd></span> bookmark</li>
            <li><span><kbd className="ui-kbd">⌘</kbd>+<kbd className="ui-kbd">↵</kbd></span> submit free response</li>
          </ul>
        </div>
      )}

      {confirmEnd && (
        <div className="ui-modal-backdrop" onMouseDown={() => setConfirmEnd(false)}>
          <div className="ui-modal runner-confirm" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label="Finish test">
            <h3>Finish this test?</h3>
            <p>You’ve answered {answeredCount} of {questions.length}. Unanswered questions will be marked as skipped.</p>
            <div className="runner-confirm-actions">
              <button className="ui-btn ui-btn-ghost" onClick={() => setConfirmEnd(false)}>Keep going</button>
              {onExit && <button className="ui-btn ui-btn-outline" onClick={onExit}>Exit without saving</button>}
              <button className="ui-btn ui-btn-primary" onClick={finish}>See results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
