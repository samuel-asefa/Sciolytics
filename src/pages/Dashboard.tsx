import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Lock, Bookmark, TrendingUp, Heart } from 'lucide-react';
import { questionService } from '../services/questionService';

const mockHeatmapData = Array.from({ length: 365 }, (_, i) => ({
  date: i,
  value: Math.floor(Math.random() * 5),
}));

export default function Dashboard() {
  const [progress, setProgress] = useState(questionService.getProgress());
  const [dailyStats, setDailyStats] = useState(questionService.getDailyStats());
  const [favoritedEvents, setFavoritedEvents] = useState<string[]>([]);

  useEffect(() => {
    // Refresh stats
    setProgress(questionService.getProgress());
    setDailyStats(questionService.getDailyStats());
    setFavoritedEvents(questionService.getProgress().favorites);
  }, []);

  const displayedFavorites = favoritedEvents.slice(0, 4);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-card">
          <h1>Welcome back! 👋</h1>
          <p>Ready to tackle some Science Olympiad questions?</p>
        </div>
        <Link to="/practice" className="practice-button">
          <PenTool size={20} />
          Practice
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Daily Correct Answers</h3>
          <div className="stat-value green">
            {dailyStats.correct}/{dailyStats.answered}
          </div>
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
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="config-box">
                    No favorited event
                  </div>
                ))}
              </>
            )}
          </div>
          {favoritedEvents.length > 4 && (
            <p className="more-favorites">+{favoritedEvents.length - 4} more</p>
          )}
        </div>

        <div className="questions-answered-card">
          <h3>Questions Answered</h3>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Today</span>
              <span className="stat-number">{dailyStats.answered}</span>
              {dailyStats.answered > 0 && <TrendingUp size={14} className="trend-up" />}
            </div>
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-number">{progress.questionsAnswered}</span>
              {progress.questionsAnswered > 0 && <TrendingUp size={14} className="trend-up" />}
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-number">{progress.accuracy.toFixed(1)}%</span>
              {progress.accuracy > 0 && <TrendingUp size={14} className="trend-up" />}
            </div>
          </div>
          <div className="chart-toggle">
            <button className="toggle-btn">Line</button>
            <button className="toggle-btn active">Heatmap</button>
          </div>
          <div className="heatmap-container">
            <div className="heatmap-grid">
              {mockHeatmapData.map((item, idx) => (
                <div
                  key={idx}
                  className="heatmap-cell"
                  style={{ opacity: item.value * 0.2 + 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="accuracy-card">
          <h3>Daily Accuracy</h3>
          <div className="accuracy-gauge">
            <div className="gauge-circle">
              <div
                className="gauge-fill"
                style={{ '--percentage': `${dailyStats.accuracy}%` } as React.CSSProperties}
              ></div>
              <div className="gauge-text">{dailyStats.accuracy.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <Link to="/load-test" className="action-card">
          <Lock size={24} className="action-icon" />
          <div>
            <h4>Load Test with Code</h4>
            <p>Take a test with a friend</p>
          </div>
        </Link>

        <Link to="/bookmarks" className="action-card">
          <Bookmark size={24} className="action-icon green" />
          <div>
            <h4>Bookmarks</h4>
            <p>View and practice over your bookmarked questions</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
