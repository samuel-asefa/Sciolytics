import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Home, RotateCcw, BarChart3 } from 'lucide-react';
import { questionService } from '../services/questionService';

export default function PracticeResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, totalQuestions, answeredCount } = location.state || {
    score: { correct: 0, total: 0 },
    totalQuestions: 0,
    answeredCount: 0,
  };

  const accuracy = score.total > 0 ? (score.correct / score.total) * 100 : 0;
  const progress = questionService.getProgress();

  const getGrade = (acc: number): string => {
    if (acc >= 90) return 'A+';
    if (acc >= 80) return 'A';
    if (acc >= 70) return 'B';
    if (acc >= 60) return 'C';
    return 'D';
  };

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
            <div className="stat-grade">{getGrade(accuracy)}</div>
          </div>
        </div>

        <div className="overall-stats">
          <h2>Overall Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Questions Answered</span>
              <span className="stat-number">{progress.questionsAnswered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Correct</span>
              <span className="stat-number">{progress.questionsCorrect}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Overall Accuracy</span>
              <span className="stat-number">{progress.accuracy.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Favorited Events</span>
              <span className="stat-number">{progress.favorites.length}</span>
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

