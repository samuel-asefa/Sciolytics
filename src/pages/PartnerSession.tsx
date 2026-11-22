import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Copy, Check, Users, Play, Flag, Clock, ArrowLeft, ArrowRight, Loader2, LogOut, Crown, Send, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { questionService } from '../services/questionService';
import { partnerService, MAX_PARTNERS, type PartnerSession as Session } from '../services/partnerService';
import { aiGradingService } from '../services/aiGradingService';
import { firestoreService } from '../services/firestoreService';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import type { ReviewItem } from '../components/TestRunner';
import type { Question } from '../data/questionBank';
import { eventMeta } from '../lib/events';
import '../styles/test-runner.css';
import './Partner.css';

const PALETTE = ['#1f6feb', '#ec4899', '#10b981'];

export default function PartnerSession() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const { refresh } = useUserData();
  const uid = currentUser?.uid ?? '';

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [grading, setGrading] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const joinedRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => { questionService.initialize().then(() => setReady(true)); }, []);

  useEffect(() => {
    if (!code) return;
    const unsub = partnerService.subscribe(code, setSession, err => {
      console.error(err);
      setError(err.message.includes('permission') ? 'Partner mode needs the latest Firestore rules deployed (see README).' : 'Could not connect to this session.');
    });
    return () => unsub();
  }, [code]);

  // Auto-join
  useEffect(() => {
    if (!session || !currentUser || joinedRef.current) return;
    if (session.participants[uid]) { joinedRef.current = true; return; }
    if (session.status === 'finished') return;
    if (Object.keys(session.participants).length >= MAX_PARTNERS) { setError('This session is full.'); return; }
    joinedRef.current = true;
    partnerService.join(code, currentUser).catch(err => { console.error(err); setError('Could not join this session.'); });
  }, [session, currentUser, uid, code]);

  // Ticking clock for the shared timer
  useEffect(() => {
    if (session?.status !== 'active' || !session.timeLimitSec) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [session?.status, session?.timeLimitSec]);

  const questions = useMemo<Question[]>(() => {
    if (!ready || !session) return [];
    return session.questionIds.map(id => questionService.getById(id)).filter(Boolean) as Question[];
  }, [ready, session]);

  const participants = useMemo(() => {
    if (!session) return [];
    return Object.entries(session.participants)
      .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
      .map(([id, p], i) => ({ id, ...p, color: PALETTE[i % PALETTE.length] }));
  }, [session]);

  const colorOf = (id?: string) => participants.find(p => p.id === id)?.color ?? 'var(--text-tertiary)';
  const nameOf = (id?: string) => (id === uid ? 'You' : participants.find(p => p.id === id)?.name ?? 'Partner');

  const startedMs = session?.startedAt?.toMillis?.() ?? null;
  const remaining = session?.timeLimitSec && startedMs ? Math.max(0, Math.round((startedMs + session.timeLimitSec * 1000 - now) / 1000)) : null;

  const buildReview = (s: Session): ReviewItem[] =>
    questions.map((q, i) => ({
      question: q,
      answer: s.answers?.[i]?.answer ?? '',
      isCorrect: s.results?.[i] ? s.results[i].isCorrect : null,
      feedback: s.results?.[i]?.feedback,
    }));

  const submit = async () => {
    if (!session) return;
    setConfirmSubmit(false);
    setGrading(true);
    try {
      const results: NonNullable<Session['results']> = {};
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const a = session.answers?.[i]?.answer;
        if (!a) continue;
        if (q.type === 'MCQ') results[i] = { isCorrect: a === q.correctAnswer };
        else {
          const g = await aiGradingService.gradeFRQ(q.question, q.correctAnswer, q.explanation || '', a);
          results[i] = { isCorrect: g.isCorrect, feedback: g.feedback };
        }
      }
      await partnerService.finish(code, uid, results);
    } catch (err) {
      console.error(err);
      toast('Could not submit. Try again.', 'error');
    } finally {
      setGrading(false);
    }
  };

  // Auto-submit when the shared clock hits zero (host only, to avoid double grading)
  useEffect(() => {
    if (remaining === 0 && session?.status === 'active' && session.hostId === uid && !grading) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // Record stats once per participant when finished
  useEffect(() => {
    if (session?.status !== 'finished' || savedRef.current || !uid || !session.participants[uid]) return;
    savedRef.current = true;
    questions.forEach((q, i) => {
      const r = session.results?.[i];
      if (r) firestoreService.saveAnswer(uid, q, r.isCorrect).catch(console.error);
    });
    setTimeout(refresh, 1500);
  }, [session, uid, questions, refresh]);

  if (error) {
    return (
      <div className="ui-page">
        <div className="ui-card ui-empty">
          <div className="ui-empty-icon"><AlertTriangle size={22} /></div>
          <h3>{error}</h3>
          <Link to="/partner" className="ui-btn ui-btn-outline">Back to Partner Mode</Link>
        </div>
      </div>
    );
  }

  if (session === undefined || !ready) return <PageLoadingScreen loading label="Connecting" />;

  if (session === null) {
    return (
      <div className="ui-page">
        <div className="ui-card ui-empty">
          <div className="ui-empty-icon"><Users size={22} /></div>
          <h3>No session with code {code}</h3>
          <p>Double-check the code with your partner.</p>
          <Link to="/partner" className="ui-btn ui-btn-outline">Back</Link>
        </div>
      </div>
    );
  }

  const meta = eventMeta(session.event);
  const isHost = session.hostId === uid;
  const shareUrl = `${window.location.origin}/partner/${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { toast(shareUrl, 'info'); }
  };

  const leave = async () => {
    await partnerService.leave(code, uid).catch(() => {});
    navigate('/partner');
  };

  // ── Lobby ──
  if (session.status === 'lobby') {
    return (
      <div className="ui-page partner-lobby" style={{ ['--ev' as string]: meta.color }}>
        <div className="ui-card lobby-card">
          <span className="ui-eyebrow"><meta.icon size={13} /> {session.title}</span>
          <h1>Waiting room</h1>
          <p className="ui-muted">Share this code or link with your partner. {questions.length} questions{session.timeLimitSec ? ` · ${Math.round(session.timeLimitSec / 60)} min` : ' · untimed'}.</p>
          <div className="lobby-code" aria-label={`Session code ${code}`}>
            {code.split('').map((c, i) => <span key={i}>{c}</span>)}
          </div>
          <button className="ui-btn ui-btn-outline" onClick={copy}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy invite link</>}</button>

          <div className="lobby-people">
            {participants.map(p => (
              <div key={p.id} className="lobby-person">
                <span className="lobby-avatar" style={{ background: p.color }}>{p.photo ? <img src={p.photo} alt="" referrerPolicy="no-referrer" /> : p.name.slice(0, 1).toUpperCase()}</span>
                <span>{p.id === uid ? `${p.name} (you)` : p.name}</span>
                {p.id === session.hostId && <Crown size={13} className="lobby-crown" />}
              </div>
            ))}
            {participants.length < 2 && (
              <div className="lobby-person is-waiting"><span className="lobby-avatar"><Loader2 size={14} className="spin" /></span><span>Waiting for partner…</span></div>
            )}
          </div>

          <div className="lobby-actions">
            <button className="ui-btn ui-btn-ghost" onClick={leave}><LogOut size={15} /> Leave</button>
            {isHost ? (
              <button className="ui-btn ui-btn-primary ui-btn-lg" onClick={() => partnerService.start(code)}>
                <Play size={16} /> {participants.length < 2 ? 'Start solo' : 'Start test'}
              </button>
            ) : (
              <span className="lobby-wait">The host will start the test</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Finished ──
  if (session.status === 'finished') {
    const review = buildReview(session);
    const correct = review.filter(r => r.isCorrect).length;
    const answered = review.filter(r => r.isCorrect !== null).length;
    return (
      <div className="ui-page partner-lobby" style={{ ['--ev' as string]: meta.color }}>
        <div className="ui-card lobby-card">
          <span className="ui-eyebrow"><meta.icon size={13} /> {session.title}</span>
          <h1>{correct} / {questions.length}</h1>
          <p className="ui-muted">Team score{answered < questions.length ? ` · ${questions.length - answered} left blank` : ''}. Submitted by {nameOf(session.finishedBy)}.</p>
          <div className="lobby-split">
            {participants.map(p => {
              const n = Object.values(session.answers ?? {}).filter(a => a.by === p.id).length;
              return (
                <div key={p.id} className="lobby-split-item">
                  <span className="lobby-avatar" style={{ background: p.color }}>{p.name.slice(0, 1).toUpperCase()}</span>
                  <b className="ui-tnum">{n}</b>
                  <span>answered by {p.id === uid ? 'you' : p.name}</span>
                </div>
              );
            })}
          </div>
          <div className="lobby-actions">
            <Link to="/partner" className="ui-btn ui-btn-ghost">New session</Link>
            <button className="ui-btn ui-btn-primary" onClick={() => navigate('/practice/results', { state: { review, title: `Partner · ${session.title}`, source: 'partner' } })}>
              Review answers <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active ──
  const q = questions[index];
  if (!q) return <PageLoadingScreen loading />;
  const ans = session.answers?.[index];
  const flaggedBy = session.flags?.[index];
  const answeredCount = Object.keys(session.answers ?? {}).length;

  const go = (i: number) => {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
    partnerService.setCurrent(code, uid, i).catch(() => {});
  };

  const choose = (opt: string) => {
    partnerService.answer(code, uid, index, ans?.answer === opt ? '' : opt).catch(() => toast('Answer not saved. Check your connection.', 'error'));
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="ui-page partner-live" style={{ ['--ev' as string]: meta.color }}>
      <div className="live-bar">
        <div className="live-bar-left">
          <span className="runner-event-icon"><meta.icon size={17} /></span>
          <div>
            <span className="live-title">{session.title}</span>
            <span className="live-sub"><span className="live-dot" /> Live · {code} · {answeredCount}/{questions.length} answered</span>
          </div>
        </div>
        <div className="live-people">
          {participants.map(p => (
            <span key={p.id} className="live-person" style={{ ['--pc' as string]: p.color }} title={`${p.name} · on Q${p.current + 1}`}>
              <span className="lobby-avatar" style={{ background: p.color }}>{p.name.slice(0, 1).toUpperCase()}</span>
              <span className="live-person-q">Q{p.current + 1}</span>
            </span>
          ))}
        </div>
        <div className="live-bar-right">
          {remaining !== null && <span className={`runner-timer ui-tnum${remaining <= 60 ? ' is-low' : ''}`}><Clock size={15} /> {fmt(remaining)}</span>}
          <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setConfirmSubmit(true)} disabled={grading}>
            {grading ? <><Loader2 size={14} className="spin" /> Grading…</> : <><Send size={14} /> Submit</>}
          </button>
        </div>
      </div>

      <div className="runner-nav live-nav">
        {questions.map((_, i) => {
          const a = session.answers?.[i];
          const here = participants.filter(p => p.current === i && p.id !== uid);
          return (
            <button
              key={i}
              className={`runner-dot${i === index ? ' is-current' : ''}${a ? ' is-answered' : ''}${session.flags?.[i] ? ' is-flagged' : ''}`}
              style={a ? { background: `color-mix(in srgb, ${colorOf(a.by)} 16%, transparent)`, color: colorOf(a.by), borderColor: 'transparent' } : undefined}
              onClick={() => go(i)}
            >
              {i + 1}
              {here.map(p => <span key={p.id} className="live-pip" style={{ background: p.color }} />)}
            </button>
          );
        })}
      </div>

      <article className="ui-card runner-card" key={index}>
        <div className="runner-q-head">
          <div className="runner-tags">
            <span className="ui-chip ui-chip-primary">{q.type === 'MCQ' ? 'Multiple choice' : 'Free response'}</span>
            <span className="ui-chip">{q.difficulty}</span>
            {q.subtopic && <span className="ui-chip">{q.subtopic}</span>}
          </div>
          <button
            className={`live-flag${flaggedBy ? ' is-on' : ''}`}
            onClick={() => partnerService.flag(code, uid, index, !flaggedBy)}
            title={flaggedBy ? `Flagged by ${nameOf(flaggedBy)}` : 'Flag for your partner'}
          >
            <Flag size={15} fill={flaggedBy ? 'currentColor' : 'none'} /> {flaggedBy ? `Flagged by ${nameOf(flaggedBy)}` : 'Flag'}
          </button>
        </div>

        <h2 className="runner-question">{q.question}</h2>

        {q.type === 'MCQ' && q.options ? (
          <div className="runner-options">
            {q.options.map((opt, i) => {
              const picked = ans?.answer === opt;
              return (
                <button
                  key={i}
                  className={`runner-option${picked ? ' selected' : ''}`}
                  style={picked ? { borderColor: colorOf(ans?.by), background: `color-mix(in srgb, ${colorOf(ans?.by)} 10%, transparent)` } : undefined}
                  onClick={() => choose(opt)}
                >
                  <span className="runner-letter" style={picked ? { background: colorOf(ans?.by), color: '#fff', borderColor: 'transparent' } : undefined}>{String.fromCharCode(65 + i)}</span>
                  <span className="runner-option-text">{opt}</span>
                  {picked && <span className="live-by" style={{ color: colorOf(ans?.by) }}>{nameOf(ans?.by)}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <FrqBox
            key={index}
            value={ans?.answer ?? ''}
            by={ans?.by ? nameOf(ans.by) : null}
            color={colorOf(ans?.by)}
            onSave={v => partnerService.answer(code, uid, index, v)}
          />
        )}

        <div className="runner-actions">
          <button className="ui-btn ui-btn-ghost" onClick={() => go(index - 1)} disabled={index === 0}><ArrowLeft size={16} /> Previous</button>
          <button className="ui-btn ui-btn-primary" onClick={() => (index < questions.length - 1 ? go(index + 1) : setConfirmSubmit(true))}>
            {index < questions.length - 1 ? <>Next <ArrowRight size={16} /></> : <>Submit <Send size={15} /></>}
          </button>
        </div>
      </article>

      {confirmSubmit && (
        <div className="ui-modal-backdrop" onMouseDown={() => setConfirmSubmit(false)}>
          <div className="ui-modal runner-confirm" onMouseDown={e => e.stopPropagation()}>
            <h3>Submit for both of you?</h3>
            <p>{answeredCount} of {questions.length} answered. This ends the test for everyone in the session.</p>
            <div className="runner-confirm-actions">
              <button className="ui-btn ui-btn-ghost" onClick={() => setConfirmSubmit(false)}>Keep working</button>
              <button className="ui-btn ui-btn-primary" onClick={submit}><Send size={15} /> Submit &amp; grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Free-response box that syncs on pause, so typing doesn't spam writes. */
function FrqBox({ value, by, color, onSave }: { value: string; by: string | null; color: string; onSave: (v: string) => Promise<void> }) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accept partner edits when we're not actively typing
  useEffect(() => { if (!focused) setDraft(value); }, [value, focused]);

  const change = (v: string) => {
    setDraft(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(v.trim()).catch(() => {}), 700);
  };

  return (
    <div className="runner-frq">
      <textarea
        className="ui-input"
        rows={6}
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onSave(draft.trim()).catch(() => {}); }}
        onChange={e => change(e.target.value)}
        placeholder="Write your team’s answer… (syncs automatically)"
      />
      {by && <span className="live-by" style={{ color, marginTop: 6, display: 'inline-block' }}>Last edited by {by}</span>}
    </div>
  );
}
