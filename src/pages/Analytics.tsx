import { useState, useEffect } from 'react';
import { BarChart3, Target, TrendingUp, Award, BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type UserSummary } from '../services/firestoreService';

interface EventStat { event: string; answered: number; correct: number; accuracy: number }
interface DifficultyStat { difficulty: string; answered: number; correct: number; accuracy: number }
interface DayAccuracy { date: string; accuracy: number; answered: number }

const DIFF_COLORS: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

const EVENT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#6366f1'];

export default function Analytics() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'difficulty' | 'history'>('overview');
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [eventStats, setEventStats] = useState<EventStat[]>([]);
  const [difficultyStats, setDifficultyStats] = useState<DifficultyStat[]>([]);
  const [historyData, setHistoryData] = useState<DayAccuracy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [prog, events, difficulty, history] = await Promise.all([
          firestoreService.getProgress(uid),
          firestoreService.getEventBreakdown(uid),
          firestoreService.getDifficultyBreakdown(uid),
          firestoreService.getDailyAccuracyHistory(uid, 30),
        ]);
        if (!cancelled) {
          setSummary(prog);
          setEventStats(events);
          setDifficultyStats(difficulty);
          setHistoryData(history);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [uid]);

  const totalAnswered = summary?.questionsAnswered ?? 0;
  const totalCorrect = summary?.questionsCorrect ?? 0;
  const overallAccuracy = summary?.accuracy ?? 0;
  const bestEvent = eventStats.sort((a, b) => b.accuracy - a.accuracy)[0];
  const worstEvent = eventStats.filter(e => e.answered >= 3).sort((a, b) => a.accuracy - b.accuracy)[0];

  const EmptyState = ({ message }: { message: string }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', color: 'var(--text-secondary)', gap: '12px'
    }}>
      <BarChart3 size={48} style={{ opacity: 0.3 }} />
      <h3 style={{ margin: 0 }}>{message}</h3>
      <p style={{ margin: 0, fontSize: '14px' }}>Answer some practice questions to see your stats here.</p>
    </div>
  );

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>My Analytics</h1>
          <p>Your real performance data, based on questions you've actually answered.</p>
        </div>
      </div>

      <div className="analytics-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: <Target size={16} /> },
          { id: 'events', label: 'By Event', icon: <BookOpen size={16} /> },
          { id: 'difficulty', label: 'By Difficulty', icon: <Award size={16} /> },
          { id: 'history', label: 'History', icon: <TrendingUp size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading your analytics…
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat summary row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Answered', value: totalAnswered, color: 'var(--primary-color)' },
                  { label: 'Total Correct', value: totalCorrect, color: '#10b981' },
                  { label: 'Overall Accuracy', value: `${overallAccuracy}%`, color: overallAccuracy >= 70 ? '#10b981' : overallAccuracy >= 50 ? '#f59e0b' : '#ef4444' },
                  { label: 'Events Practiced', value: eventStats.length, color: 'var(--primary-color)' },
                ].map(stat => (
                  <div key={stat.label} className="stat-card" style={{ textAlign: 'center' }}>
                    <h3>{stat.label}</h3>
                    <div className="stat-value" style={{ color: stat.color, fontSize: '40px' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {totalAnswered === 0 ? (
                <EmptyState message="No data yet" />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {bestEvent && (
                    <div className="stat-card">
                      <h3>🏆 Strongest Event</h3>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', margin: '8px 0 4px' }}>
                        {bestEvent.event}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {bestEvent.accuracy}% accuracy ({bestEvent.correct}/{bestEvent.answered})
                      </p>
                    </div>
                  )}
                  {worstEvent && (
                    <div className="stat-card">
                      <h3>📚 Needs Work</h3>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444', margin: '8px 0 4px' }}>
                        {worstEvent.event}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {worstEvent.accuracy}% accuracy ({worstEvent.correct}/{worstEvent.answered})
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── BY EVENT ── */}
          {activeTab === 'events' && (
            <div>
              {eventStats.length === 0 ? (
                <EmptyState message="No event data yet" />
              ) : (
                <>
                  <div className="leaderboard-container">
                    <div className="leaderboard-table">
                      <div className="leaderboard-header">
                        <div style={{ flex: 2 }}>Event</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>Answered</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>Correct</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>Accuracy</div>
                      </div>
                      {eventStats.map(stat => (
                        <div key={stat.event} className="leaderboard-row">
                          <div style={{ flex: 2 }}>
                            <div className="school-name">{stat.event}</div>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center' }}>{stat.answered}</div>
                          <div style={{ flex: 1, textAlign: 'center' }}>{stat.correct}</div>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <span style={{
                              color: stat.accuracy >= 70 ? '#10b981' : stat.accuracy >= 50 ? '#f59e0b' : '#ef4444',
                              fontWeight: 700,
                            }}>
                              {stat.accuracy}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ marginBottom: '16px' }}>Accuracy by Event</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={eventStats} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={12} stroke="var(--text-secondary)" />
                        <YAxis type="category" dataKey="event" width={160} fontSize={11} stroke="var(--text-secondary)" />
                        <Tooltip formatter={(v: number) => [`${v}%`, 'Accuracy']} />
                        <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                          {eventStats.map((_, idx) => (
                            <Cell key={idx} fill={EVENT_COLORS[idx % EVENT_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── BY DIFFICULTY ── */}
          {activeTab === 'difficulty' && (
            <div>
              {difficultyStats.every(d => d.answered === 0) ? (
                <EmptyState message="No difficulty data yet" />
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                    {difficultyStats.map(stat => (
                      <div key={stat.difficulty} className="stat-card" style={{ textAlign: 'center' }}>
                        <h3 style={{ color: DIFF_COLORS[stat.difficulty] }}>{stat.difficulty}</h3>
                        <div className="stat-value" style={{ color: DIFF_COLORS[stat.difficulty], fontSize: '36px' }}>
                          {stat.accuracy}%
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
                          {stat.correct}/{stat.answered} correct
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ marginBottom: '16px' }}>Questions by Difficulty</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={difficultyStats}>
                        <XAxis dataKey="difficulty" fontSize={13} stroke="var(--text-secondary)" />
                        <YAxis fontSize={12} stroke="var(--text-secondary)" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="answered" name="Answered" fill="rgba(99,102,241,0.4)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="correct" name="Correct" radius={[4, 4, 0, 0]}>
                          {difficultyStats.map((stat, idx) => (
                            <Cell key={idx} fill={DIFF_COLORS[stat.difficulty]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── HISTORY ── */}
          {activeTab === 'history' && (
            <div>
              {historyData.length === 0 ? (
                <EmptyState message="No history data yet" />
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                  <h3 style={{ marginBottom: '4px' }}>Daily Accuracy — Last 30 Days</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                    Only shows days where you answered at least one question.
                  </p>
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis
                        dataKey="date"
                        fontSize={11}
                        stroke="var(--text-secondary)"
                        tickFormatter={d => d.slice(5)} // MM-DD
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={v => `${v}%`}
                        fontSize={12}
                        stroke="var(--text-secondary)"
                      />
                      <Tooltip
                        formatter={(v: number, name: string) => [
                          name === 'accuracy' ? `${v}%` : v,
                          name === 'accuracy' ? 'Accuracy' : 'Questions'
                        ]}
                        labelFormatter={l => `Date: ${l}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="var(--primary-color)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="accuracy"
                      />
                      <Line
                        type="monotone"
                        dataKey="answered"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        strokeDasharray="4 2"
                        name="answered"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
