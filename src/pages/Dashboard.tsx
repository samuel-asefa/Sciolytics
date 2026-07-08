import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Lock, Bookmark, TrendingUp, Heart, Flame } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type UserSummary, type DaySession } from '../services/firestoreService';

interface HeatCell { date: string; count: number }
interface WeekDay { name: string; questions: number; correct: number }

type ChartRange = 7 | 30 | 90;

export default function Dashboard() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DaySession>({ date: '', answered: 0, correct: 0, accuracy: 0 });
  const [heatmapData, setHeatmapData] = useState<HeatCell[]>([]);
  const [chartData, setChartData] = useState<WeekDay[]>([]);
  const [chartType, setChartType] = useState<'line' | 'heatmap'>('heatmap');
  const [chartRange, setChartRange] = useState<ChartRange>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    async function load() {
      try {
        const [prog, daily, heat] = await Promise.all([
          firestoreService.getProgress(uid),
          firestoreService.getDailyStats(uid),
          firestoreService.getActivityHeatmap(uid, 91),
        ]);
        if (!cancelled) {
          setSummary(prog);
          setDailyStats(daily);
          setHeatmapData(heat);
          setLoading(false);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [uid]);

  useEffect(() => {
    if (!uid || chartType !== 'line') return;
    firestoreService.getChartActivity(uid, chartRange).then(setChartData).catch(console.error);
  }, [uid, chartType, chartRange]);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'there';
  const favorites = summary?.favorites ?? [];
  const displayedFavorites = favorites.slice(0, 4);
  const maxCount = Math.max(1, ...heatmapData.map(d => d.count));

  const heatColor = (count: number) => {
    if (count === 0) return 'rgba(0,0,0,0.06)';
    const intensity = count / maxCount;
    return `color-mix(in srgb, var(--primary-color) ${Math.round((0.15 + intensity * 0.85) * 100)}%, transparent)`;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="welcome-card"><h1>Loading your dashboard…</h1></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-card">
          <h1>Welcome back, {displayName}! 👋</h1>
          <p>Ready to tackle some Science Olympiad questions?</p>
        </div>
        <Link to="/practice" className="practice-button">
          <PenTool size={20} />Practice
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Today's Correct</h3>
          <div className="stat-value green">{dailyStats.correct}/{dailyStats.answered}</div>
          {dailyStats.answered > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {dailyStats.accuracy}% accuracy today
            </p>
          )}
        </div>

        <div className="favorited-configs-card">
          <h3>Favorited Events</h3>
          <div className="config-grid">
            {displayedFavorites.length > 0 ? (
              displayedFavorites.map((event, i) => (
                <div key={i} className="config-box favorited-event">
                  <Heart size={16} className="favorite-icon" />
                  <span className="event-name-small">{event}</span>
                </div>
              ))
            ) : (
              <div className="config-box" style={{ gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No favorites yet — star an event in Practice
              </div>
            )}
          </div>
          {favorites.length > 4 && <p className="more-favorites">+{favorites.length - 4} more</p>}
        </div>

        <div className="questions-answered-card">
          <h3>Questions Answered</h3>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Today</span>
              <span className="stat-number">
                {dailyStats.answered}
                {dailyStats.answered > 0 && <TrendingUp size={14} className="trend-up" />}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-number">
                {summary?.questionsAnswered ?? 0}
                {(summary?.questionsAnswered ?? 0) > 0 && <TrendingUp size={14} className="trend-up" />}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">All-time Accuracy</span>
              <span className="stat-number">
                {summary?.accuracy ?? 0}%
                {(summary?.accuracy ?? 0) > 0 && <TrendingUp size={14} className="trend-up" />}
              </span>
            </div>
          </div>

          <div className="chart-toggle">
            <button className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>
              Line Chart
            </button>
            <button className={`toggle-btn ${chartType === 'heatmap' ? 'active' : ''}`} onClick={() => setChartType('heatmap')}>
              Activity Map
            </button>
          </div>

          {chartType === 'line' && (
            <div className="chart-range-selector">
              {([7, 30, 90] as ChartRange[]).map(r => (
                <button key={r} className={`range-btn ${chartRange === r ? 'active' : ''}`} onClick={() => setChartRange(r)}>
                  {r}d
                </button>
              ))}
            </div>
          )}

          <div className="heatmap-container">
            {chartType === 'heatmap' ? (
              <>
                <div className="heatmap-grid">
                  {heatmapData.map((item, idx) => (
                    <div
                      key={idx}
                      className="heatmap-cell"
                      style={{ background: heatColor(item.count) }}
                      title={`${item.date}: ${item.count} question${item.count !== 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
                {heatmapData.every(d => d.count === 0) && (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
                    No activity yet — start practicing to see your heatmap fill up!
                  </p>
                )}
              </>
            ) : (
              <div style={{ width: '100%', height: '150px', marginTop: '10px' }}>
                {chartData.every(d => d.questions === 0) ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', paddingTop: '50px' }}>
                    No activity in this period — start practicing!
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="name" fontSize={11} stroke="var(--text-secondary)" tickLine={false} axisLine={false} interval={chartRange === 90 ? 9 : chartRange === 30 ? 4 : 0} />
                      <YAxis fontSize={12} stroke="var(--text-secondary)" tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        formatter={(value: number, name: string) => [value, name === 'questions' ? 'Questions' : 'Correct']}
                      />
                      <Line type="monotone" dataKey="questions" stroke="var(--primary-color)" strokeWidth={3} dot={chartRange === 7 ? { r: 4 } : false} activeDot={{ r: 5 }} name="questions" />
                      <Line type="monotone" dataKey="correct" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="correct" strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="accuracy-card">
          <h3>Daily Accuracy</h3>
          <div className="accuracy-gauge">
            <div className="gauge-circle" style={{ '--percentage': `${dailyStats.accuracy}%` } as React.CSSProperties}>
              <div className="gauge-text">{dailyStats.accuracy}%</div>
            </div>
          </div>
          {dailyStats.answered === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
              Answer questions today to see your accuracy
            </p>
          )}
        </div>

        <Link to="/load-test" className="action-card">
          <Lock size={24} className="action-icon" />
          <div><h4>Load Test with Code</h4><p>Take a test with a friend</p></div>
        </Link>
        <Link to="/bookmarks" className="action-card">
          <Bookmark size={24} className="action-icon green" />
          <div><h4>Bookmarks</h4><p>Review your saved questions</p></div>
        </Link>
        <Link to="/analytics" className="action-card">
          <Flame size={24} className="action-icon" style={{ color: '#f97316' }} />
          <div><h4>My Analytics</h4><p>See your performance by event and difficulty</p></div>
        </Link>
      </div>
    </div>
  );
}
