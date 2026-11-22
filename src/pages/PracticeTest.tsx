import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionService, type QuestionFilter } from '../services/questionService';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useToast } from '../components/Toast';
import type { Question } from '../data/questionBank';
import PageLoadingScreen from '../components/PageLoadingScreen';
import TestRunner, { type ReviewItem } from '../components/TestRunner';

export default function PracticeTest() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const { refresh } = useUserData();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [title, setTitle] = useState('Practice test');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const configStr = sessionStorage.getItem('testConfig');
    if (!configStr) { navigate('/practice', { replace: true }); return; }

    questionService.initialize().then(() => {
      const config: QuestionFilter = JSON.parse(configStr);
      if (sessionStorage.getItem('unansweredOnly') === 'true') {
        try { config.excludeIds = JSON.parse(sessionStorage.getItem('answeredIds') || '[]'); } catch { /* ignore */ }
      }
      const loaded = questionService.getQuestions(config);
      if (loaded.length === 0) {
        toast('No questions found for those filters', 'error');
        navigate('/practice', { replace: true });
        return;
      }
      const unlimited = sessionStorage.getItem('unlimitedMode') === 'true';
      setTimeLimit(unlimited ? null : parseInt(sessionStorage.getItem('timeLimit') || '10', 10) * 60);
      setTitle(config.ids ? 'Retry missed questions' : `${config.event ?? 'Practice'}${config.subtopic ? ` · ${config.subtopic}` : ''}${unlimited ? ' · Endless' : ''}`);
      setQuestions(loaded);
    });

    if (currentUser?.uid) {
      firestoreService.getBookmarks(currentUser.uid)
        .then(b => setBookmarkedIds(new Set(b.map(x => x.id))))
        .catch(console.error);
    }
  }, [navigate, currentUser?.uid, toast]);

  if (questions.length === 0) return <PageLoadingScreen loading label="Building your test" />;

  const handleAnswer = (q: Question, isCorrect: boolean) => {
    if (currentUser?.uid) firestoreService.saveAnswer(currentUser.uid, q, isCorrect).catch(console.error);
  };

  const handleBookmark = async (q: Question) => {
    if (!currentUser?.uid) return;
    const on = !bookmarkedIds.has(q.id);
    setBookmarkedIds(prev => { const n = new Set(prev); if (on) n.add(q.id); else n.delete(q.id); return n; });
    try {
      await firestoreService.toggleBookmark(currentUser.uid, q);
      toast(on ? 'Bookmarked' : 'Bookmark removed');
    } catch {
      toast('Could not update bookmark', 'error');
    }
  };

  const handleFinish = (review: ReviewItem[], meta: { elapsedSec: number }) => {
    refresh();
    navigate('/practice/results', { state: { review, elapsedSec: meta.elapsedSec, title, source: 'practice' } });
  };

  return (
    <TestRunner
      questions={questions}
      title={title}
      timeLimitSec={timeLimit}
      onAnswer={handleAnswer}
      onFinish={handleFinish}
      onExit={() => navigate('/practice')}
      bookmarkedIds={bookmarkedIds}
      onToggleBookmark={handleBookmark}
    />
  );
}
