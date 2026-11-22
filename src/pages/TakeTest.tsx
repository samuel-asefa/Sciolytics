import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { firestoreService, type CustomTest } from '../services/firestoreService';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import TestRunner, { type ReviewItem } from '../components/TestRunner';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const { refresh } = useUserData();
  const [test, setTest] = useState<CustomTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!testId) return;
    firestoreService.getCustomTest(testId)
      .then(data => {
        if (!data) {
          toast('Test not found', 'error');
          navigate('/community', { replace: true });
          return;
        }
        setTest(data);
      })
      .catch(err => {
        console.error(err);
        toast('You don’t have access to this test', 'error');
        navigate('/community', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [testId, navigate, toast]);

  if (loading || !test) return <PageLoadingScreen loading label="Loading test" />;

  if (test.questions.length === 0) {
    return (
      <div className="ui-page">
        <div className="ui-empty">
          <div className="ui-empty-icon"><FileQuestion size={24} /></div>
          <h3>This test has no questions yet</h3>
          <button className="ui-btn ui-btn-outline" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  if (!started) {
    const events = Array.from(new Set(test.questions.map(q => q.event).filter(Boolean)));
    const mcq = test.questions.filter(q => q.type === 'MCQ').length;
    return (
      <div className="ui-page" style={{ maxWidth: 640 }}>
        <div className="ui-card ui-card-pad take-intro">
          <span className="ui-eyebrow">Custom test</span>
          <h1 style={{ fontSize: 28, margin: '10px 0 8px' }}>{test.title || 'Untitled test'}</h1>
          {test.description && <p className="ui-muted" style={{ whiteSpace: 'pre-wrap' }}>{test.description}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '18px 0 22px' }}>
            <span className="ui-chip ui-chip-primary">{test.questions.length} questions</span>
            <span className="ui-chip">{mcq} multiple choice</span>
            <span className="ui-chip">{test.questions.length - mcq} free response</span>
            {events.slice(0, 3).map(e => <span key={e} className="ui-chip">{e}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ui-btn ui-btn-primary ui-btn-lg" onClick={() => setStarted(true)}>Start test</button>
            <button className="ui-btn ui-btn-ghost ui-btn-lg" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  const handleFinish = (review: ReviewItem[], meta: { elapsedSec: number }) => {
    refresh();
    navigate('/practice/results', { state: { review, elapsedSec: meta.elapsedSec, title: test.title, source: 'custom', testId } });
  };

  return (
    <TestRunner
      questions={test.questions}
      title={test.title || 'Custom test'}
      onAnswer={(q, ok) => { if (currentUser?.uid) firestoreService.saveAnswer(currentUser.uid, q, ok).catch(console.error); }}
      onFinish={handleFinish}
      onExit={() => navigate(-1)}
    />
  );
}
