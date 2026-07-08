import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Home, RotateCcw, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';

export default function PracticeResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { score, totalQuestions, answeredCount } = location.state || {
    score: { correct: 0, total: 0 },
    totalQuestions: 0,
    answeredCount: 0,
  };

  const accuracy = score.total > 0 ? (score.correct / score.total) * 100 : 0;

  const [liveProgress, setLiveProgress] = useState({ questionsAnswered: 0, questionsCorrect: 0, accuracy: 0, favorites: [] as string[] });

  useEffect(() => {
    if (!currentUser?.uid) return;
    firestoreService.getProgress(currentUser.uid)
      .then(prog => setLiveProgress({
        questionsAnswered: prog.questionsAnswered,
        questionsCorrect: prog.questionsCorrect,
        accuracy: prog.accuracy,
        favorites: prog.favorites,
      }))
      .catch(console.error);
  }, [currentUser]);


  return (
    <div className="practice-results">
      <div className="results-container">
        <div className="results-header">
          <Trophy size={48} className="trophy-icon" />
          <h1>Test Complete!</h1>
          <p>You answered {answeredCount} out of {totalQuestions} questions</p>
        </div>

        <div className="results-stats">
          <div className="stat-card">
            <div className="stat-value">{score.correct}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{score.total - score.correct}</div>
            <div className="stat-label">Incorrect</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{accuracy.toFixed(1)}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>

        <div className="overall-stats">
          <h2>Overall Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Questions Answered</span>
              <span className="stat-number">{liveProgress.questionsAnswered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Correct</span>
              <span className="stat-number">{liveProgress.questionsCorrect}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Overall Accuracy</span>
              <span className="stat-number">{liveProgress.accuracy}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Favorited Events</span>
              <span className="stat-number">{liveProgress.favorites.length}</span>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn-secondary" onClick={() => navigate('/practice')}>
            <RotateCcw size={18} />
            Practice Again
          </button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            <BarChart3 size={18} />
            View Dashboard
          </button>
          <button className="btn-primary" onClick={() => navigate('/practice')}>
            <Home size={18} />
            Back to Practice
          </button>
        </div>
      </div>
    </div>
  );
}

