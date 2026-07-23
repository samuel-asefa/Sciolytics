import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type CustomTest, isAdmin } from '../services/firestoreService';
import PageLoadingScreen from '../components/PageLoadingScreen';

export default function Community() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [tests, setTests] = useState<CustomTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const isUserAdmin = isAdmin(currentUser);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const publicTests = await firestoreService.getPublicCustomTests();
      setTests(publicTests);
    } catch (err) {
      console.error('Error loading public tests', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (test: CustomTest) => {
    if (!isUserAdmin) return;
    if (!confirm(`Are you sure you want to publish the questions from "${test.title}" to the official question bank?`)) return;
    
    setPublishingId(test.id || null);
    try {
      await firestoreService.publishQuestionsToBank(test);
      alert('Questions successfully published to the Official Question Bank!');
    } catch (err) {
      console.error('Failed to publish', err);
      alert('Failed to publish questions. Make sure you have admin rights.');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) return <PageLoadingScreen loading={true} />;

  return (
    <div className="community-page" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Globe size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>Community Tests</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore and take custom tests shared by the Sciolytics community.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {tests.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '20px' }}>
            No community tests found yet. Share a test with a team to make it public!
          </div>
        ) : tests.map(test => (
          <div
            key={test.id}
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--card-shadow)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, paddingRight: '12px' }}>{test.title}</h3>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', flex: 1, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {test.description || 'No description provided.'}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <FileText size={14} />
              {test.questions.length} questions
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => navigate(`/test/${test.id}`)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Take Test <ArrowRight size={16} />
              </button>
              
              {isUserAdmin && (
                <button
                  onClick={() => handlePublish(test)}
                  disabled={publishingId === test.id}
                  title="Approve and Publish to Question Bank"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 16px',
                    background: 'color-mix(in srgb, #10b981 10%, transparent)',
                    color: '#10b981',
                    border: '1px solid color-mix(in srgb, #10b981 30%, transparent)',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: publishingId === test.id ? 'not-allowed' : 'pointer',
                    opacity: publishingId === test.id ? 0.5 : 1
                  }}
                >
                  {publishingId === test.id ? '...' : <CheckCircle2 size={18} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
