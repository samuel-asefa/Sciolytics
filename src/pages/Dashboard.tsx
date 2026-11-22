import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PenTool, Flame, Target, TrendingUp, CheckCircle2, Layers, FileText, Handshake, Lock, Bookmark,
  BarChart3, ArrowRight, Heart, BookOpen, Zap, Pencil, Sparkles,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { eventMeta } from '../lib/events';
import './Dashboard.css';

type ChartRange = 7 | 30 | 90;
const GOAL_KEY = 'sciolytics:dailyGoal';

function readGoal() {
  try { return Math.max(5, parseInt(localStorage.getItem(GOAL_KEY) || '20', 10) || 20); } catch { return 20; }
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Burning the midnight oil';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function Ring({ value, size = 76, stroke = 8, color = 'var(--primary-color)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-gray)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.8s var(--ease-out)' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { summary, dailyStats, heatmapData, chartData7, chartData30, chartData90, loaded } = useUserData();

  const [chartType, setChartType] = useState<'line' | 'heatmap'>('line');
  const [chartRange, setChartRange] = useState<ChartRange>(30);
  const [goal, setGoal] = useState(readGoal);
  const [editingGoal, setEditingGoal] = useState(false);

  const firstName = (currentUser?.displayName || currentUser?.email?.split('@')[0] || 'there').split(' ')[0];
  const favorites = summary?.favorites ?? [];

  const streak = useMemo(() => {
    if (!heatmapData.length) return 0;
    let s = 0;
    let i = heatmapData.length - 1;
    // Today not done yet doesn't break the streak
    if (heatmapData[i].count === 0) i--;
    for (; i >= 0 && heatmapData[i].count > 0; i--) s++;
    return s;
  }, [heatmapData]);

  const activeDays = heatmapData.filter(d => d.count > 0).length;
  const maxCount = Math.max(1, ...heatmapData.map(d => d.count));

  const focusAreas = useMemo(() => {
    const byEvent = summary?.byEvent ?? {};
    return Object.entries(byEvent)
      .filter(([, s]) => s.answered >= 3)
      .map(([event, s]) => ({ event, answered: s.answered, accuracy: Math.round((s.correct / s.answered) * 100) }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 4);
  }, [summary]);

  const chartData = chartRange === 7 ? chartData7 : chartRange === 30 ? chartData30 : chartData90;
  const rangeTotal = chartData.reduce((a, d) => a + d.questions, 0);
  const hasActivity = chartData.some(d => d.questions > 0);

  if (!loaded) return <PageLoadingScreen loading label="Loading your dashboard" />;

  const goalPct = dailyStats.answered / goal;

  const saveGoal = (g: number) => {
    const v = Math.max(5, Math.min(500, g || 20));
    setGoal(v);
    try { localStorage.setItem(GOAL_KEY, String(v)); } catch { /* ignore */ }
    setEditingGoal(false);
  };

  const weeks: { date: string; count: number }[][] = [];
  heatmapData.forEach((d, i) => {
    const w = Math.floor(i / 7);
    (weeks[w] ??= []).push(d);
  });

  const level = (c: number) => (c === 0 ? 0 : Math.min(4, Math.ceil((c / maxCount) * 4)));

  return (
    <div className="dash ui-page">
      {/* Header */}
      <header className="dash-head">
        <div>
          <span className="ui-eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <h1>{greeting()}, {firstName}.</h1>
          <p>
            {dailyStats.answered === 0
              ? 'A few questions today keeps your streak alive.'
              : goalPct >= 1
                ? 'Daily goal crushed. Anything extra is bonus reps.'
                : `${goal - dailyStats.answered} more question${goal - dailyStats.answered === 1 ? '' : 's'} to hit today’s goal.`}
          </p>
        </div>
        <div className="dash-head-actions">
          <Link to="/flashcards" className="ui-btn ui-btn-outline"><Layers size={16} /> Review cards</Link>
          <Link to="/practice" className="ui-btn ui-btn-primary"><PenTool size={16} /> Start practice</Link>
        </div>
      </header>

      {/* KPI row */}
      <section className="dash-kpis">
        <div className="ui-card kpi kpi-goal">
          <Ring value={goalPct} color={goalPct >= 1 ? 'var(--success)' : 'var(--primary-color)'}>
            {goalPct >= 1 ? <CheckCircle2 size={22} color="var(--success)" /> : <b className="ui-tnum">{Math.round(goalPct * 100)}%</b>}
          </Ring>
          <div className="kpi-body">
            <span className="kpi-label">Daily goal</span>
            <span className="kpi-value ui-tnum">{dailyStats.answered}<small>/{goal}</small></span>
            {editingGoal ? (
              <form className="goal-form" onSubmit={e => { e.preventDefault(); saveGoal(parseInt((e.currentTarget.elements.namedItem('g') as HTMLInputElement).value, 10)); }}>
                <input name="g" type="number" min={5} max={500} defaultValue={goal} autoFocus aria-label="Daily goal" onBlur={e => saveGoal(parseInt(e.target.value, 10))} />
              </form>
            ) : (
              <button className="kpi-link" onClick={() => setEditingGoal(true)}><Pencil size={11} /> Edit goal</button>
            )}
          </div>
        </div>

        <div className="ui-card kpi">
          <span className={`kpi-icon${streak > 0 ? ' is-hot' : ''}`}><Flame size={20} /></span>
          <div className="kpi-body">
            <span className="kpi-label">Streak</span>
            <span className="kpi-value ui-tnum">{streak}<small> day{streak === 1 ? '' : 's'}</small></span>
            <span className="kpi-sub">{activeDays} active days in 13 weeks</span>
          </div>
        </div>

        <div className="ui-card kpi">
          <span className="kpi-icon"><Target size={20} /></span>
          <div className="kpi-body">
            <span className="kpi-label">Accuracy today</span>
            <span className="kpi-value ui-tnum">{dailyStats.answered ? `${dailyStats.accuracy}%` : '–'}</span>
            <span className="kpi-sub">{dailyStats.correct} correct of {dailyStats.answered}</span>
          </div>
        </div>

        <div className="ui-card kpi">
          <span className="kpi-icon"><TrendingUp size={20} /></span>
          <div className="kpi-body">
            <span className="kpi-label">All time</span>
            <span className="kpi-value ui-tnum">{(summary?.questionsAnswered ?? 0).toLocaleString()}<small> Qs</small></span>
            <span className="kpi-sub">{summary?.accuracy ?? 0}% overall accuracy</span>
          </div>
        </div>
      </section>

      {/* Activity + focus */}
      <section className="dash-row">
        <div className="ui-card ui-card-pad dash-activity">
          <div className="card-head">
            <div>
              <h2>Activity</h2>
              <p className="ui-muted">{chartType === 'line' ? `${rangeTotal} questions in the last ${chartRange} days` : `${activeDays} active days · last 13 weeks`}</p>
            </div>
            <div className="card-head-controls">
              {chartType === 'line' && (
                <div className="ui-segment">
                  {([7, 30, 90] as ChartRange[]).map(r => (
                    <button key={r} className={chartRange === r ? 'is-active' : ''} onClick={() => setChartRange(r)}>{r}d</button>
                  ))}
                </div>
              )}
              <div className="ui-segment">
                <button className={chartType === 'line' ? 'is-active' : ''} onClick={() => setChartType('line')}>Trend</button>
                <button className={chartType === 'heatmap' ? 'is-active' : ''} onClick={() => setChartType('heatmap')}>Heatmap</button>
              </div>
            </div>
          </div>

          {chartType === 'line' ? (
            hasActivity ? (
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-color)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--primary-color)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" fontSize={11} stroke="var(--text-tertiary)" tickLine={false} axisLine={false} interval={chartRange === 90 ? 14 : chartRange === 30 ? 5 : 0} />
                    <YAxis fontSize={11} stroke="var(--text-tertiary)" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ stroke: 'var(--border-strong)' }}
                      contentStyle={{ background: 'var(--surface-solid)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-lg)' }}
                      labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      formatter={(value, name) => [value as number, name === 'questions' ? 'Answered' : 'Correct']}
                    />
                    <Area type="monotone" dataKey="questions" stroke="var(--primary-color)" strokeWidth={2.5} fill="url(#dashArea)" name="questions" />
                    <Area type="monotone" dataKey="correct" stroke="var(--success)" strokeWidth={2} fill="transparent" strokeDasharray="4 3" name="correct" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="ui-empty dash-empty">
                <div className="ui-empty-icon"><BarChart3 size={24} /></div>
                <h3>No activity in this window</h3>
                <p>Answer a few questions and your trend line will start drawing itself.</p>
                <Link to="/practice" className="ui-btn ui-btn-soft ui-btn-sm">Practice now <ArrowRight size={14} /></Link>
              </div>
            )
          ) : (
            <div className="heat-wrap">
              <div className="heat">
                {weeks.map((w, wi) => (
                  <div key={wi} className="heat-col">
                    {w.map(d => (
                      <span key={d.date} className="heat-cell" data-l={level(d.count)} title={`${new Date(d.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${d.count} question${d.count === 1 ? '' : 's'}`} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="heat-legend">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map(l => <span key={l} className="heat-cell" data-l={l} />)}
                <span>More</span>
              </div>
            </div>
          )}
        </div>

        <div className="ui-card ui-card-pad dash-focus">
          <div className="card-head">
            <div>
              <h2>Focus areas</h2>
              <p className="ui-muted">Your lowest-accuracy events</p>
            </div>
            <Link to="/analytics" className="ui-btn ui-btn-ghost ui-btn-sm">Analytics <ArrowRight size={14} /></Link>
          </div>
          {focusAreas.length > 0 ? (
            <ul className="focus-list">
              {focusAreas.map(f => {
                const m = eventMeta(f.event);
                return (
                  <li key={f.event}>
                    <span className="focus-icon" style={{ color: m.color, background: `color-mix(in srgb, ${m.color} 12%, transparent)` }}><m.icon size={16} /></span>
                    <div className="focus-body">
                      <div className="focus-top">
                        <span className="focus-name">{f.event}</span>
                        <span className={`focus-acc ui-tnum ${f.accuracy >= 70 ? 'good' : f.accuracy >= 50 ? 'ok' : 'bad'}`}>{f.accuracy}%</span>
                      </div>
                      <div className="ui-progress"><span style={{ width: `${f.accuracy}%`, background: f.accuracy >= 70 ? 'var(--success)' : f.accuracy >= 50 ? 'var(--warning)' : 'var(--danger)' }} /></div>
                    </div>
                    <button className="ui-btn ui-btn-soft ui-btn-sm ui-btn-icon" title={`Practice ${f.event}`} onClick={() => navigate('/practice', { state: { selectedEvent: f.event } })}>
                      <Zap size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="ui-empty dash-empty">
              <div className="ui-empty-icon"><Sparkles size={22} /></div>
              <h3>Not enough data yet</h3>
              <p>After a few questions per event, we’ll point out exactly where you’re losing points.</p>
            </div>
          )}
        </div>
      </section>

      {/* Favorites */}
      <section className="dash-section">
        <div className="section-head">
          <h2>Your events</h2>
          <Link to="/practice" className="ui-btn ui-btn-ghost ui-btn-sm">{favorites.length ? 'Manage' : 'Pick events'} <ArrowRight size={14} /></Link>
        </div>
        {favorites.length > 0 ? (
          <div className="fav-grid">
            {favorites.map(ev => {
              const m = eventMeta(ev);
              const s = summary?.byEvent?.[ev];
              const acc = s && s.answered ? Math.round((s.correct / s.answered) * 100) : null;
              return (
                <div key={ev} className="ui-card fav-card" style={{ ['--ev' as string]: m.color }}>
                  <div className="fav-top">
                    <span className="fav-icon"><m.icon size={18} /></span>
                    <Heart size={14} className="fav-heart" fill="currentColor" />
                  </div>
                  <h3>{ev}</h3>
                  <p className="ui-muted">{s ? `${s.answered} answered · ${acc}% accuracy` : 'Not started yet'}</p>
                  <div className="fav-actions">
                    <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => navigate('/practice', { state: { selectedEvent: ev } })}>Practice</button>
                    {m.kind !== 'Build' && <Link to={`/flashcards/${m.slug}`} className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" title="Flashcards"><Layers size={15} /></Link>}
                    {m.wikiId && <Link to={`/wiki/${m.wikiId}`} className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" title="Wiki"><BookOpen size={15} /></Link>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ui-card fav-empty">
            <Heart size={18} />
            <span>Heart the events you compete in on the Practice page and they’ll live here with one-click practice, flashcards and wiki links.</span>
            <Link to="/practice" className="ui-btn ui-btn-soft ui-btn-sm">Choose events</Link>
          </div>
        )}
      </section>

      {/* Tools */}
      <section className="dash-section">
        <div className="section-head"><h2>Study tools</h2></div>
        <div className="tool-grid">
          {[
            { to: '/flashcards', icon: Layers, title: 'Flashcards', desc: 'Spaced repetition from the bank', color: '#6366f1' },
            { to: '/cheatsheets', icon: FileText, title: 'Cheat sheets', desc: 'Print-ready note sheets', color: '#f59e0b' },
            { to: '/partner', icon: Handshake, title: 'Partner mode', desc: 'Live tests with a partner', color: '#ec4899' },
            { to: '/bookmarks', icon: Bookmark, title: 'Bookmarks', desc: 'Questions you saved', color: '#10b981' },
            { to: '/load-test', icon: Lock, title: 'Load a test', desc: 'Enter a share code', color: '#0ea5e9' },
            { to: '/analytics', icon: BarChart3, title: 'Analytics', desc: 'Deep performance stats', color: '#ef4444' },
          ].map(t => (
            <Link key={t.to} to={t.to} className="ui-card ui-card-interactive tool" style={{ ['--ev' as string]: t.color }}>
              <span className="tool-icon"><t.icon size={18} /></span>
              <span className="tool-body">
                <span className="tool-title">{t.title}</span>
                <span className="tool-desc">{t.desc}</span>
              </span>
              <ArrowRight size={15} className="tool-arrow" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
