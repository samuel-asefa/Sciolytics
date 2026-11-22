import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, X, ChevronDown, Sparkles, BarChart3, Layers, FileText, Users, BookOpen,
  Handshake, Wand2, Target, Moon, Sun, Menu, Timer, Filter, Trophy, Flame, Zap, GraduationCap,
  ClipboardCheck, ShieldCheck, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import { EVENTS, CATEGORY_SHORT, type EventCategory } from '../lib/events';
import type { Question } from '../data/questionBank';
import '../styles/layout.css';
import './Landing.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface BankStats {
  questions: number;
  events: number;
  subtopics: number;
  byEvent: Record<string, number>;
  demo: Question[];
}

const DEMO_EVENTS = ['Anatomy & Physiology', 'Astronomy', 'Dynamic Planet', 'Chemistry Lab', 'Rocks and Minerals', 'Disease Detectives', 'Circuit Lab', 'Botany'];

function pickDemo(bank: Question[]): Question[] {
  const out: Question[] = [];
  for (const ev of DEMO_EVENTS) {
    const pool = bank.filter(q =>
      q.event === ev && q.type === 'MCQ' && q.options && q.options.length >= 3 && q.options.length <= 5 &&
      q.explanation && q.explanation.length > 30 && q.question.length < 190 &&
      q.options.every(o => o.length < 70) && q.options.includes(q.correctAnswer)
    );
    if (pool.length) out.push(pool[Math.floor(Math.random() * pool.length)]);
    if (out.length === 5) break;
  }
  return out;
}

/** Adds .is-visible once an element scrolls into view (CSS handles the motion). */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    el.querySelectorAll('.reveal').forEach(n => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1100;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    // rAF doesn't run in background tabs / some crawlers: never leave a stat at 0
    const fallback = setTimeout(() => setN(value), 1800);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [value]);
  return <span ref={ref} className="ui-tnum">{n.toLocaleString()}{suffix}</span>;
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// ─── Try-a-question demo ──────────────────────────────────────────────────────

function DemoQuestion({ stats, onSignUp }: { stats: BankStats | null; onSignUp: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const demo = stats?.demo ?? [];
  const q = demo[idx];

  const choose = (opt: string) => {
    if (picked || !q) return;
    setPicked(opt);
    if (opt === q.correctAnswer) setCorrectCount(c => c + 1);
  };

  const next = () => {
    if (idx + 1 >= demo.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setPicked(null);
  };

  const restart = () => { setIdx(0); setPicked(null); setCorrectCount(0); setDone(false); };

  // keyboard: 1-5 / A-E to answer, Enter for next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      const el = document.getElementById('try');
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (!q || done) return;
      const k = e.key.toLowerCase();
      const i = '12345'.indexOf(k) >= 0 ? '12345'.indexOf(k) : 'abcde'.indexOf(k);
      if (i >= 0 && q.options && i < q.options.length) choose(q.options[i]);
      else if (e.key === 'Enter' && picked) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!stats) {
    return (
      <div className="demo-card" aria-busy="true">
        <div className="demo-top"><span className="ui-skeleton" style={{ width: 140, height: 22 }} /></div>
        <div className="ui-skeleton" style={{ height: 18, width: '92%', marginTop: 18 }} />
        <div className="ui-skeleton" style={{ height: 18, width: '70%', marginTop: 10 }} />
        {[0, 1, 2, 3].map(i => <div key={i} className="ui-skeleton" style={{ height: 46, marginTop: 12, borderRadius: 12 }} />)}
      </div>
    );
  }

  if (done) {
    return (
      <div className="demo-card demo-done">
        <div className="demo-done-ring">
          <Trophy size={30} />
        </div>
        <h3>{correctCount}/{demo.length} correct</h3>
        <p>
          {correctCount === demo.length ? 'Flawless. You’re ready for the hard stuff.' : correctCount >= demo.length / 2 ? 'Solid start. Imagine what a week of reps does.' : 'That’s what practice is for.'}
          {' '}There are <strong>{stats.questions.toLocaleString()}</strong> more questions waiting, all tracked and explained.
        </p>
        <div className="demo-done-actions">
          <button className="ui-btn ui-btn-primary ui-btn-lg" onClick={onSignUp}>
            Keep practicing free <ArrowRight size={16} />
          </button>
          <button className="ui-btn ui-btn-ghost" onClick={restart}><RotateCcw size={15} /> Try again</button>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const meta = EVENTS.find(e => e.name === q.event);
  const Icon = meta?.icon ?? BookOpen;

  return (
    <div className="demo-card">
      <div className="demo-top">
        <span className="demo-event" style={{ color: meta?.color, background: `color-mix(in srgb, ${meta?.color ?? '#3b82f6'} 12%, transparent)` }}>
          <Icon size={14} /> {q.event}
        </span>
        <span className="demo-progress">
          {demo.map((_, i) => <span key={i} className={i < idx ? 'is-done' : i === idx ? 'is-current' : ''} />)}
        </span>
      </div>
      <div className="demo-meta">
        <span>{q.subtopic}</span>
        <span>·</span>
        <span>{q.difficulty}</span>
        {q.tournament && <><span>·</span><span>{q.tournament}{q.year ? ` ${q.year}` : ''}</span></>}
      </div>
      <p className="demo-question">{q.question}</p>
      <div className="demo-options" role="radiogroup" aria-label="Answer choices">
        {q.options!.map((opt, i) => {
          const isRight = picked && opt === q.correctAnswer;
          const isWrong = picked === opt && opt !== q.correctAnswer;
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={picked === opt}
              className={`demo-option${isRight ? ' is-right' : ''}${isWrong ? ' is-wrong' : ''}${picked && !isRight && !isWrong ? ' is-dim' : ''}`}
              onClick={() => choose(opt)}
              disabled={!!picked}
            >
              <span className="demo-letter">{String.fromCharCode(65 + i)}</span>
              <span className="demo-option-text">{opt}</span>
              {isRight && <Check size={18} />}
              {isWrong && <X size={18} />}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="demo-explain">
          <div className="demo-explain-head">
            {picked === q.correctAnswer ? <><Check size={15} /> Correct</> : <><X size={15} /> Not quite: the answer is {String.fromCharCode(65 + q.options!.indexOf(q.correctAnswer))}</>}
          </div>
          <p>{q.explanation}</p>
          <button className="ui-btn ui-btn-ink ui-btn-sm" onClick={next}>
            {idx + 1 >= demo.length ? 'See my score' : 'Next question'} <ArrowRight size={14} />
          </button>
        </div>
      )}
      {!picked && (
        <div className="demo-hint">Press <kbd className="ui-kbd">A</kbd>–<kbd className="ui-kbd">{String.fromCharCode(64 + q.options!.length)}</kbd> to answer</div>
      )}
    </div>
  );
}

// ─── Bento mini-visuals ───────────────────────────────────────────────────────

function MiniBars() {
  const data = [
    { l: 'Anatomy', v: 86 }, { l: 'Astronomy', v: 64 }, { l: 'Dynamic Planet', v: 78 }, { l: 'Chem Lab', v: 41 }, { l: 'Forensics', v: 57 },
  ];
  return (
    <div className="mini-bars">
      {data.map(d => (
        <div key={d.l} className="mini-bar-row">
          <span>{d.l}</span>
          <div className="mini-bar-track"><span style={{ width: `${d.v}%`, background: d.v >= 70 ? 'var(--success)' : d.v >= 50 ? 'var(--warning)' : 'var(--danger)' }} /></div>
          <b className="ui-tnum">{d.v}%</b>
        </div>
      ))}
    </div>
  );
}

function MiniHeat() {
  const cells = useMemo(() => Array.from({ length: 7 * 18 }, (_, i) => {
    const v = Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.31) * 0.5;
    return Math.max(0, Math.min(4, Math.round((v + 0.6) * 2.4)));
  }), []);
  return (
    <div className="mini-heat">
      {cells.map((c, i) => <span key={i} data-l={c} />)}
    </div>
  );
}

function BentoTile({ icon, title, children, className = '', visual }: { icon: ReactNode; title: string; children: ReactNode; className?: string; visual?: ReactNode }) {
  return (
    <article className={`bento-tile reveal ${className}`}>
      <div className="bento-copy">
        <span className="bento-icon">{icon}</span>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
      {visual && <div className="bento-visual">{visual}</div>}
    </article>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: 'Is Sciolytics really free?',
    a: 'Yes. Practice, analytics, flashcards, cheat sheets, teams and the wiki are all free. Sign in with Google and start practicing in seconds.',
  },
  {
    q: 'Where do the questions come from?',
    a: 'Most questions come from past invitational tests, Scioly.org Summer Study Session exams and practice tests. Each one is tagged with its source and year where known. Community members can also publish tests, and admins review them before anything is merged into the official bank.',
  },
  {
    q: 'How is AI used?',
    a: 'Multiple choice is graded exactly, with no AI involved. AI grades free-response answers against the official key and explains what you missed. It can also turn your notes into practice questions and help edit questions in the test builder. You always see the official answer key next to any AI feedback.',
  },
  {
    q: 'Is this an official Science Olympiad product?',
    a: 'No. Sciolytics is an independent, student-built project. It is not affiliated with or endorsed by Science Olympiad, Inc. Always check the official rules manual for your season.',
  },
  {
    q: 'Does it cover Division B and Division C?',
    a: 'Both. Filter practice by division, difficulty, subtopic and question type, or practice only the questions you haven’t seen yet.',
  },
  {
    q: 'Can my whole team use it?',
    a: 'Yes. Captains and coaches can create a team with a join code, build rosters by event, post to a team stream, assign tests with due dates, schedule on a shared calendar and track everyone’s progress.',
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {FAQS.map((f, i) => (
        <div key={f.q} className={`faq-item${open === i ? ' is-open' : ''}`}>
          <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {f.q}
            <ChevronDown size={18} />
          </button>
          <div className="faq-a" hidden={open !== i}><p>{f.a}</p></div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  const { signInWithGoogle } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [stats, setStats] = useState<BankStats | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catFilter, setCatFilter] = useState<EventCategory | 'All'>('All');
  const pageRef = useReveal<HTMLDivElement>();

  const from = (location.state as { from?: string } | null)?.from;
  const isLoginRoute = location.pathname === '/login';

  useEffect(() => {
    document.title = isLoginRoute
      ? 'Sign in · Sciolytics'
      : 'Sciolytics | Free Science Olympiad Practice Tests, Flashcards & Analytics';
  }, [isLoginRoute]);

  // Load the question bank in the background for live stats + the demo.
  useEffect(() => {
    let cancelled = false;
    const load = () => import('../data/questionBank').then(({ questionBank }) => {
      if (cancelled) return;
      const byEvent: Record<string, number> = {};
      const subs = new Set<string>();
      questionBank.forEach(q => {
        byEvent[q.event] = (byEvent[q.event] ?? 0) + 1;
        subs.add(`${q.event}:${q.subtopic}`);
      });
      setStats({
        questions: questionBank.length,
        events: EVENTS.length,
        subtopics: subs.size,
        byEvent,
        demo: pickDemo(questionBank),
      });
    });
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(load); else setTimeout(load, 200);
    return () => { cancelled = true; };
  }, []);

  // Deep links like /#faq from other pages (this page is lazy-loaded, so wait for it)
  useEffect(() => {
    if (!location.hash) return;
    const t = setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120);
    return () => clearTimeout(t);
  }, [location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      setError('');
      setSigningIn(true);
      await signInWithGoogle();
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError((err as Error)?.message || 'Failed to sign in with Google');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const visibleEvents = EVENTS.filter(e => catFilter === 'All' || e.category === catFilter);
  const categories = Object.keys(CATEGORY_SHORT) as EventCategory[];

  return (
    <div className="landing" ref={pageRef}>
      {/* ── Nav ── */}
      <header className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <Link to="/" className="logo-container" aria-label="Sciolytics home"><Logo size={30} /></Link>
          <nav className="lp-nav-links" aria-label="Landing">
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('events')}>Events</button>
            <Link to="/wiki">Wiki</Link>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
          </nav>
          <div className="lp-nav-actions">
            <button className="nav-icon-btn" onClick={toggleDark} aria-label={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="ui-btn ui-btn-ghost ui-btn-sm lp-signin" onClick={handleSignIn} disabled={signingIn}>Sign in</button>
            <button className="ui-btn ui-btn-ink ui-btn-sm" onClick={handleSignIn} disabled={signingIn}>
              {signingIn ? 'Opening…' : 'Start free'}
            </button>
            <button className="nav-icon-btn lp-burger" aria-label="Menu" onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('events')}>Events</button>
            <Link to="/wiki">Event Wiki</Link>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
            <Link to="/about">About</Link>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <button className="lp-pill" onClick={() => scrollTo('features')}>
              <span className="lp-pill-new">New</span>
              Flashcards, cheat sheets &amp; partner mode
              <ArrowRight size={14} />
            </button>
            <h1>
              Practice like a <span className="lp-serif">medalist</span>.
            </h1>
            <p className="lp-sub">
              {stats ? <><strong>{stats.questions.toLocaleString()}</strong> real tournament questions</> : <>Thousands of real tournament questions</>} across
              every 2026 Science Olympiad event, with AI-graded free response, flashcards, cheat sheets and
              analytics that tell you exactly what to study next.
            </p>
            <div className="lp-cta-row">
              <button className="ui-btn ui-btn-ink ui-btn-lg lp-google" onClick={handleSignIn} disabled={signingIn}>
                <span className="lp-google-g"><GoogleG /></span>
                {signingIn ? 'Opening Google…' : 'Continue with Google'}
              </button>
              <button className="ui-btn ui-btn-outline ui-btn-lg" onClick={() => scrollTo('try')}>
                Try a question
              </button>
            </div>
            {error && <p className="lp-error" role="alert">{error}</p>}
            <ul className="lp-assurances">
              <li><Check size={14} /> Free forever</li>
              <li><Check size={14} /> Division B &amp; C</li>
              <li><Check size={14} /> Built by competitors</li>
            </ul>
          </div>

          <div className="lp-hero-demo" id="try">
            <div className="lp-demo-glow" />
            <div className="lp-demo-label"><Sparkles size={13} /> Try it, no account needed</div>
            <DemoQuestion stats={stats} onSignUp={handleSignIn} />
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="lp-stats reveal" aria-label="Sciolytics by the numbers">
          <div className="lp-stat">
            <b>{stats ? <CountUp value={stats.questions} suffix="+" /> : <span className="ui-skeleton lp-stat-skel" />}</b>
            <span>practice questions</span>
          </div>
          <div className="lp-stat">
            <b><CountUp value={EVENTS.length} /></b>
            <span>2026 events covered</span>
          </div>
          <div className="lp-stat">
            <b>{stats ? <CountUp value={stats.subtopics} /> : <span className="ui-skeleton lp-stat-skel" />}</b>
            <span>subtopics to drill</span>
          </div>
          <div className="lp-stat">
            <b>$0</b>
            <span>forever</span>
          </div>
        </section>

        {/* ── Social proof ── */}
        <section className="lp-logos">
          <p>Sciolytics helps students win medals at Science Olympiad invitationals hosted by</p>
          <div className="social-proof-marquee">
            <div className="social-proof-logos">
              {[...Array(2)].flatMap((_, k) =>
                ['mit', 'stanford', 'harvard', 'princeton', 'yale', 'columbia', 'upenn', 'cornell', 'berkeley', 'cmu'].map(s => (
                  <img key={`${s}-${k}`} src={`/${s}.png`} alt={k === 0 ? s.toUpperCase() : ''} aria-hidden={k === 1} loading="lazy" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Features bento ── */}
        <section className="lp-section" id="features">
          <div className="lp-section-head reveal">
            <span className="ui-eyebrow">Everything in one place</span>
            <h2>Every tool a medal-winning team uses, <span className="lp-serif">in one place</span>.</h2>
            <p>No more juggling Google Docs, PDF test packets and spreadsheets. Sciolytics covers practice, review and teamwork.</p>
          </div>

          <div className="bento">
            <BentoTile
              className="bento-wide"
              icon={<Target size={18} />}
              title="A practice engine that adapts to you"
              visual={
                <div className="mock-filters">
                  <div className="mock-filter-row">
                    <span className="mock-chip is-on"><Filter size={12} /> Anatomy &amp; Physiology</span>
                    <span className="mock-chip">Nervous System</span>
                    <span className="mock-chip">Hard</span>
                    <span className="mock-chip is-on">Unanswered only</span>
                  </div>
                  <div className="mock-q">
                    <div className="mock-q-head"><span>Question 7 of 20</span><span className="mock-timer"><Timer size={12} /> 12:41</span></div>
                    <div className="ui-progress"><span style={{ width: '35%' }} /></div>
                    <div className="mock-line" style={{ width: '88%' }} />
                    <div className="mock-line" style={{ width: '64%' }} />
                    <div className="mock-opts">
                      <span className="is-right">B. Sodium (Na⁺) <Check size={13} /></span>
                      <span>C. Calcium (Ca²⁺)</span>
                    </div>
                  </div>
                </div>
              }
            >
              Filter by event, subtopic, difficulty, division and type. Timed tests or unlimited drills, with
              step-by-step explanations on every question and only-unanswered mode so you never repeat yourself.
            </BentoTile>

            <BentoTile icon={<BarChart3 size={18} />} title="Analytics that find your weak spots" visual={<MiniBars />}>
              Accuracy by event, subtopic and difficulty, plus streaks and history.
            </BentoTile>

            <BentoTile
              icon={<Wand2 size={18} />}
              title="AI-graded free response"
              visual={
                <div className="mock-ai">
                  <div className="mock-ai-answer">“The SA node fires first, then the impulse travels to the AV node…”</div>
                  <div className="mock-ai-feedback"><Sparkles size={13} /> Correct. You might also mention the bundle of His and Purkinje fibers.</div>
                </div>
              }
            >
              Write answers like on test day. Get graded against the official key, with feedback.
            </BentoTile>

            <BentoTile
              icon={<Layers size={18} />}
              title="Spaced-repetition flashcards"
              visual={
                <div className="mock-cards">
                  <div className="mock-card back" />
                  <div className="mock-card mid" />
                  <div className="mock-card front">
                    <span>Chandrasekhar limit</span>
                    <small>Tap to flip · <kbd className="ui-kbd">Space</kbd></small>
                  </div>
                </div>
              }
            >
              Decks built from the question bank. Cards you miss come back sooner.
            </BentoTile>

            <BentoTile
              icon={<FileText size={18} />}
              title="Print-ready cheat sheets"
              visual={
                <div className="mock-sheet">
                  <div className="mock-sheet-cols">
                    {[0, 1, 2].map(c => (
                      <div key={c}>
                        <b />
                        {[90, 70, 84, 60, 76].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              Build dense, multi-column note sheets and binders, then print to a perfect 8.5×11.
            </BentoTile>

            <BentoTile
              icon={<Users size={18} />}
              title="Team HQ for captains & coaches"
              visual={
                <div className="mock-team">
                  {['AS', 'BM', 'KP', 'JL', 'RN'].map((n, i) => (
                    <span key={n} className="mock-avatar" style={{ background: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'][i] }}>{n}</span>
                  ))}
                  <div className="mock-assign"><ClipboardCheck size={14} /> Disease Detectives set · due Fri</div>
                </div>
              }
            >
              Rosters by event, a team stream, assignments with due dates, a calendar and leaderboards.
            </BentoTile>

            <BentoTile
              className="bento-wide"
              icon={<Handshake size={18} />}
              title="Partner mode: practice like it’s competition day"
              visual={
                <div className="mock-partner">
                  <div className="mock-partner-q">
                    <span className="mock-cursor a">You</span>
                    <span className="mock-cursor b">Partner</span>
                    <div className="mock-line" style={{ width: '80%' }} />
                    <div className="mock-line" style={{ width: '55%' }} />
                  </div>
                  <div className="mock-partner-status"><span className="live-dot" /> Live · both on question 4</div>
                </div>
              }
            >
              Most events are taken in pairs, so practice that way. Share a 6-letter code, take the same test
              in real time, see each other’s answers live and split the work like you will at tournaments.
            </BentoTile>

            <BentoTile icon={<BookOpen size={18} />} title="Event wikis" visual={<MiniHeat />}>
              Clean study notes for every event, with your own highlights and annotations.
            </BentoTile>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="lp-section lp-steps-section">
          <div className="lp-section-head reveal">
            <span className="ui-eyebrow">How it works</span>
            <h2>From first question to the podium in three steps.</h2>
          </div>
          <ol className="lp-steps">
            {[
              { icon: <GraduationCap size={20} />, t: 'Pick your events', d: 'Favorite the events you compete in. Your dashboard, decks and recommendations follow them.' },
              { icon: <Zap size={20} />, t: 'Practice and review', d: 'Run timed tests or endless drills. Every answer is explained, bookmarked misses become flashcards.' },
              { icon: <Flame size={20} />, t: 'Target weak spots', d: 'Analytics show which subtopics cost you points, so each session goes where it counts.' },
            ].map((s, i) => (
              <li key={s.t} className="lp-step reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="lp-step-num">0{i + 1}</span>
                <span className="lp-step-icon">{s.icon}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Events ── */}
        <section className="lp-section" id="events">
          <div className="lp-section-head reveal">
            <span className="ui-eyebrow">2026 season</span>
            <h2>Every event, covered.</h2>
            <p>Study events get deep question banks; build events get rules, wikis and planning tools.</p>
          </div>
          <div className="lp-cat-filter" role="tablist" aria-label="Filter events by category">
            <button className={`ui-chip${catFilter === 'All' ? ' is-active' : ''}`} onClick={() => setCatFilter('All')}>All events</button>
            {categories.map(c => (
              <button key={c} className={`ui-chip${catFilter === c ? ' is-active' : ''}`} onClick={() => setCatFilter(c)}>
                {CATEGORY_SHORT[c]}
              </button>
            ))}
          </div>
          <div className="lp-events">
            {visibleEvents.map(e => {
              const count = stats?.byEvent[e.name] ?? 0;
              return (
                <Link key={e.name} to={e.wikiId ? `/wiki/${e.wikiId}` : '/wiki'} className="lp-event" style={{ ['--ev' as string]: e.color }}>
                  <span className="lp-event-icon"><e.icon size={18} /></span>
                  <span className="lp-event-body">
                    <span className="lp-event-name">{e.name}</span>
                    <span className="lp-event-meta">
                      {CATEGORY_SHORT[e.category]} · {e.kind}
                      {count > 5 && <> · <b className="ui-tnum">{count}</b> Qs</>}
                    </span>
                  </span>
                  <ArrowRight size={15} className="lp-event-arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Audiences ── */}
        <section className="lp-section">
          <div className="lp-audiences">
            <div className="lp-audience reveal">
              <span className="ui-eyebrow"><Trophy size={13} /> For competitors</span>
              <h3>Walk into every tournament knowing what you know.</h3>
              <ul>
                <li><Check size={15} /> Real tournament questions with explanations</li>
                <li><Check size={15} /> Flashcards and cheat sheets built from your misses</li>
                <li><Check size={15} /> Partner mode for paired events</li>
                <li><Check size={15} /> Streaks, history and per-subtopic accuracy</li>
              </ul>
            </div>
            <div className="lp-audience reveal">
              <span className="ui-eyebrow"><ShieldCheck size={13} /> For captains &amp; coaches</span>
              <h3>Run the whole team from one place.</h3>
              <ul>
                <li><Check size={15} /> Rosters by event, with conflict blocks</li>
                <li><Check size={15} /> Assign tests with due dates, track completion</li>
                <li><Check size={15} /> Team stream, roles and a shared calendar</li>
                <li><Check size={15} /> Build tests by hand, or import with AI</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section lp-faq" id="faq">
          <div className="lp-section-head reveal">
            <span className="ui-eyebrow">FAQ</span>
            <h2>Questions, answered.</h2>
            <p>Still curious? <Link to="/help">Visit the help center</Link> or <Link to="/contact">get in touch</Link>.</p>
          </div>
          <Faq />
        </section>

        {/* ── Final CTA ── */}
        <section className="lp-final reveal">
          <div className="lp-final-inner">
            <h2>Your next medal starts with <span className="lp-serif">one question</span>.</h2>
            <p>Join Science Olympiad competitors who study smarter with Sciolytics. It’s free.</p>
            <button className="ui-btn ui-btn-lg lp-final-btn" onClick={handleSignIn} disabled={signingIn}>
              <GoogleG /> Start practicing free
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <Logo size={28} />
            <p>The free study platform for Science Olympiad competitors, captains and coaches.</p>
          </div>
          <div className="lp-footer-col">
            <h4>Product</h4>
            <button onClick={handleSignIn}>Practice</button>
            <button onClick={handleSignIn}>Flashcards</button>
            <button onClick={handleSignIn}>Cheat sheets</button>
            <button onClick={handleSignIn}>Analytics</button>
          </div>
          <div className="lp-footer-col">
            <h4>Study</h4>
            <Link to="/wiki">Event wiki</Link>
            <Link to="/help">Help &amp; FAQ</Link>
            <button onClick={() => scrollTo('events')}>All events</button>
          </div>
          <div className="lp-footer-col">
            <h4>Sciolytics</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/join">Join the team</Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} Sciolytics</span>
          <span>Not affiliated with or endorsed by Science Olympiad, Inc.</span>
        </div>
      </footer>
    </div>
  );
}
