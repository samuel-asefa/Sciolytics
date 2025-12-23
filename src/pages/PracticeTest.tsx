import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { questionService, type QuestionFilter } from '../services/questionService';
import type { Question } from '../data/questionBank';

export default function PracticeTest() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

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
      alert('No questions found with the selected filters. Please try different settings.');
      navigate('/practice');
      return;
    }
    
    setQuestions(loadedQuestions);
    const unlimited = unlimitedStr === 'true';
    setIsUnlimited(unlimited);

    if (timeLimitStr && !unlimited) {
      setTimeRemaining(parseInt(timeLimitStr) * 60);
    }
  }, [navigate]);

  useEffect(() => {
    if (timeRemaining > 0 && !isUnlimited && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, isUnlimited, questions.length, handleFinish]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const handleSubmit = () => {
    if (!currentQuestion) return;
    if (!selectedAnswer && currentQuestion?.type === 'MCQ') return;

    try {
      const isCorrect = currentQuestion?.type === 'MCQ'
        ? selectedAnswer === currentQuestion.correctAnswer
        : selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase().slice(0, 20);

      questionService.recordAnswer(currentQuestion, isCorrect);
      questionService.recordDailyAnswer(isCorrect);

      setScore((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      setAnsweredQuestions((prev) => new Set([...prev, currentIndex]));
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('An error occurred. Please try again.');
    }
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
              disabled={showResult}
              className="frq-textarea"
            />
            {showResult && (
              <div className="frq-answer">
                <h4>Correct Answer:</h4>
                <p>{currentQuestion?.correctAnswer}</p>
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
            disabled={currentIndex === 0}
          >
            <ArrowLeft size={18} />
            Previous
          </button>

          {!showResult ? (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!selectedAnswer && currentQuestion?.type === 'MCQ'}
            >
              Submit Answer
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

