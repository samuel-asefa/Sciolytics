import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type CustomTest } from '../services/firestoreService';
import { aiGradingService } from '../services/aiGradingService';

import PageLoadingScreen from '../components/PageLoadingScreen';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [test, setTest] = useState<CustomTest | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isGrading, setIsGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    try {
      const data = await firestoreService.getCustomTest(testId!);
      if (!data) {
        alert('Test not found.');
        navigate('/teams');
        return;
      }
      setTest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = test?.questions[currentIndex];

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

      if (currentQuestion.type === 'MCQ') {
        isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      } else {
        setIsGrading(true);
        const result = await aiGradingService.gradeFRQ(
          currentQuestion.question,
          currentQuestion.correctAnswer,
          currentQuestion.explanation || '',
          selectedAnswer
        );
        isCorrect = result.isCorrect;
        setAiFeedback(result.feedback);
        setIsGrading(false);
      }

      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));

      setAnsweredQuestions(prev => new Set(prev).add(currentIndex));
      setShowResult(true);

      // Save answer to global user stats if logged in?
      // Since it's a custom test, we can optionally exclude from global stats, but for now let's just use it as practice.
      if (currentUser?.uid) {
        await firestoreService.saveAnswer(currentUser.uid, currentQuestion, isCorrect);
      }

    } catch (err) {
      console.error('Error submitting answer:', err);
      setIsGrading(false);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const handleNext = () => {
    if (!test) return;
    if (currentIndex < test.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
      setAiFeedback(null);
    } else {
      // Finished
      navigate('/practice/results', {
        state: {
          score,
          totalQuestions: test.questions.length,
          answeredCount: answeredQuestions.size,
          isCustomTest: true
        },
      });
    }
  };

  if (loading || !test) return <PageLoadingScreen loading={true} />;

  if (!currentQuestion) {
    return (
      <div className="practice-test" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Test has no questions.</h2>
        <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Go Back</button>
      </div>
    );
  }

  const isLastQuestion = currentIndex === test.questions.length - 1;

  return (
    <div className="practice-test">
      <div className="test-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Exit Test">
          <ArrowLeft size={24} />
        </button>
        <div className="progress-indicator">
          Question {currentIndex + 1} of {test.questions.length}
        </div>
        <div className="timer-display">
          <Clock size={16} />
          <span>{test.title}</span>
        </div>
      </div>

      <div className="question-container">
        <div className="question-meta">
          <span className="badge category-badge">{currentQuestion.event}</span>
          <span className="badge type-badge">{currentQuestion.type}</span>
          <span className={`badge difficulty-badge difficulty-${currentQuestion.difficulty.toLowerCase()}`}>
            {currentQuestion.difficulty}
          </span>
        </div>

        <h2 className="question-text">{currentQuestion.question}</h2>

        {currentQuestion.type === 'MCQ' ? (
          <div className="options-grid">
            {currentQuestion.options?.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = showResult && option === currentQuestion.correctAnswer;
              const isWrongSelection = showResult && isSelected && !isCorrectAnswer;

              let optionClass = 'option-btn';
              if (isSelected) optionClass += ' selected';
              if (showResult) {
                if (isCorrectAnswer) optionClass += ' correct';
                if (isWrongSelection) optionClass += ' wrong';
                if (!isSelected && !isCorrectAnswer) optionClass += ' disabled';
              }

              return (
                <button
                  key={idx}
                  className={optionClass}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                >
                  <div className="option-label">{String.fromCharCode(65 + idx)}</div>
                  <div className="option-text">{option}</div>
                  {showResult && isCorrectAnswer && <CheckCircle2 size={20} className="result-icon correct" />}
                  {showResult && isWrongSelection && <XCircle size={20} className="result-icon wrong" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="frq-container">
            <textarea
              className="frq-input"
              value={selectedAnswer}
              onChange={(e) => handleAnswer(e.target.value)}
              disabled={showResult || isGrading}
              placeholder="Type your answer here..."
              rows={4}
            />
            {isGrading && (
              <div className="grading-indicator">
                <div className="spinner"></div>
                <span>AI is grading your answer...</span>
              </div>
            )}
          </div>
        )}

        <div className="action-bar">
          {!showResult ? (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={(!selectedAnswer && currentQuestion.type === 'MCQ') || isGrading}
            >
              Submit Answer
            </button>
          ) : (
            <button className="next-btn" onClick={handleNext}>
              {isLastQuestion ? 'Finish Test' : 'Next Question'}
              <ArrowRight size={20} />
            </button>
          )}
        </div>

        {showResult && (
          <div className={`explanation-box ${selectedAnswer === currentQuestion.correctAnswer || (currentQuestion.type === 'FRQ' && aiFeedback && !aiFeedback.includes('incorrect')) ? 'correct' : 'wrong'}`}>
            <h3>
              {currentQuestion.type === 'MCQ' 
                ? (selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect')
                : (aiFeedback?.includes('incorrect') ? 'Needs Improvement' : 'Correct!')}
            </h3>
            
            {currentQuestion.type === 'FRQ' && aiFeedback && (
              <div className="ai-feedback">
                <strong>AI Feedback: </strong>
                {aiFeedback}
              </div>
            )}

            <div className="correct-answer">
              <strong>Official Answer: </strong>
              {currentQuestion.correctAnswer}
            </div>
            
            {currentQuestion.explanation && (
              <div className="explanation-text">
                <strong>Explanation: </strong>
                {currentQuestion.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
