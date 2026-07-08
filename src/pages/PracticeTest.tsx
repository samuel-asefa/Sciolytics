import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Bookmark, Loader2 } from 'lucide-react';
import { questionService, type QuestionFilter } from '../services/questionService';
import { firestoreService } from '../services/firestoreService';
import { aiGradingService } from '../services/aiGradingService';
import { useAuth } from '../contexts/AuthContext';
import type { Question } from '../data/questionBank';

export default function PracticeTest() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isGrading, setIsGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleFinish = useCallback(() => {
    navigate('/practice/results', {
      state: {
        score,
        totalQuestions: questions.length,
        answeredCount: answeredQuestions.size,
      },
    });
  }, [navigate, score, questions.length, answeredQuestions.size]);

  useEffect(() => {
    const configStr = sessionStorage.getItem('testConfig');
    const timeLimitStr = sessionStorage.getItem('timeLimit');
    const unlimitedStr = sessionStorage.getItem('unlimitedMode');

    if (!configStr) {
      navigate('/practice');
      return;
    }

    const config: QuestionFilter = JSON.parse(configStr);
    const loadedQuestions = questionService.getQuestions(config);

    if (loadedQuestions.length === 0) {
      alert('No questions found for the selected criteria.');
      navigate('/practice');
      return;
    }

    setQuestions(loadedQuestions);
    setIsUnlimited(unlimitedStr === 'true');
    setTimeRemaining(parseInt(timeLimitStr || '10') * 60);

    if (currentUser?.uid) {
      firestoreService.getProgress(currentUser.uid).then(prog => {
        setBookmarkedIds(new Set(prog.favorites ?? []));
      }).catch(console.error);
    }
  }, [navigate, currentUser?.uid]);

  useEffect(() => {
    if (isUnlimited || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isUnlimited, handleFinish]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0 || !questions[currentIndex]) {
    return (
      <div className="practice-test-loading">
        <div className="loading-spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    if (!selectedAnswer && currentQuestion?.type === 'MCQ') return;

    try {
      let isCorrect = false;
      setAiFeedback(null);

      if (currentQuestion?.type === 'MCQ') {
        isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      } else if (currentQuestion?.type === 'FRQ') {
        setIsGrading(true);
        const grade = await aiGradingService.gradeFRQ(
          currentQuestion.question,
          currentQuestion.correctAnswer,
          currentQuestion.explanation || '',
          selectedAnswer
        );
        isCorrect = grade.isCorrect;
        setAiFeedback(grade.feedback);
        setIsGrading(false);
      }
      
      if (currentUser?.uid) {
        firestoreService.saveAnswer(currentUser.uid, currentQuestion, isCorrect).catch(console.error);
      }

      setScore((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      setAnsweredQuestions((prev) => new Set([...prev, currentIndex]));
      setShowResult(true);
    } catch (error) {
      setIsGrading(false);
      console.error('Error submitting answer:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleBookmark = async () => {
    if (!currentQuestion || !currentUser?.uid) return;
    const isNowBookmarked = await firestoreService.toggleBookmark(currentUser.uid, currentQuestion);
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isNowBookmarked) next.add(currentQuestion.id);
      else next.delete(currentQuestion.id);
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="practice-test">
      <div className="test-header">
        <div className="test-info">
          <h2>Practice Test</h2>
          <span className="question-counter">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        {!isUnlimited && (
          <div className="timer">
            <Clock size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-container">
        <div className="question-header">
          <div className="question-meta">
            <span className="question-type">{currentQuestion?.type}</span>
            <span className="question-difficulty">{currentQuestion?.difficulty}</span>
            <span className="question-subtopic">{currentQuestion?.subtopic}</span>
          </div>
          <button
            onClick={handleBookmark}
            className="favorite-button"
            title={bookmarkedIds.has(currentQuestion?.id ?? '') ? 'Remove bookmark' : 'Bookmark this question'}
            style={{ marginLeft: 'auto', color: bookmarkedIds.has(currentQuestion?.id ?? '') ? '#f59e0b' : 'var(--text-secondary)' }}
          >
            <Bookmark size={20} fill={bookmarkedIds.has(currentQuestion?.id ?? '') ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="question-text">
          <h3>{currentQuestion?.question}</h3>
        </div>

        {currentQuestion?.type === 'MCQ' && currentQuestion?.options && (
          <div className="options-list">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = showResult && option === currentQuestion.correctAnswer;
              const isWrong = showResult && isSelected && option !== currentQuestion.correctAnswer;

              return (
                <button
                  key={idx}
                  className={`option-button ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                >
                  <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{option}</span>
                  {showResult && isCorrect && <CheckCircle2 size={20} className="result-icon correct-icon" />}
                  {showResult && isWrong && <XCircle size={20} className="result-icon wrong-icon" />}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion?.type === 'FRQ' && (
          <div className="frq-input">
            <textarea
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              disabled={showResult || isGrading}
              className="frq-textarea"
            />
            {showResult && (
              <div className="frq-answer">
                <h4>Correct Answer:</h4>
                <p>{currentQuestion?.correctAnswer}</p>
              </div>
            )}
            {showResult && aiFeedback && (
              <div className="frq-feedback" style={{ marginTop: '16px', padding: '16px', backgroundColor: 'color-mix(in srgb, var(--primary-color) 10%, transparent)', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', marginBottom: '8px' }}>
                  AI Feedback
                </h4>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{aiFeedback}</p>
              </div>
            )}
          </div>
        )}

        {showResult && currentQuestion?.explanation && (
          <div className="explanation">
            <h4>Explanation:</h4>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="question-actions">
          <button
            className="btn-secondary"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isGrading}
          >
            <ArrowLeft size={18} />
            Previous
          </button>

          {!showResult ? (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={(!selectedAnswer && currentQuestion?.type === 'MCQ') || isGrading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isGrading ? <><Loader2 className="spinner" size={18} style={{ animation: 'spin 1s linear infinite' }} /> Grading...</> : 'Submit Answer'}
            </button>
          ) : (
            <button className="btn-primary" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? (
                <>
                  Next
                  <ArrowRight size={18} />
                </>
              ) : (
                'Finish Test'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

