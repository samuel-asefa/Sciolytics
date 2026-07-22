import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Edit2, Loader2, FilePlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type CustomTest } from '../services/firestoreService';
import PageLoadingScreen from '../components/PageLoadingScreen';

export default function CreateDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tests, setTests] = useState<CustomTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    loadTests();
  }, [currentUser]);

  const loadTests = async () => {
    if (!currentUser) return;
    try {
      const userTests = await firestoreService.getCustomTests(currentUser.uid);
      setTests(userTests);
    } catch (err) {
      console.error('Error loading tests', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewTest = async () => {
    if (!currentUser) return;
    try {
      const newTestId = await firestoreService.createCustomTest({
        title: 'Untitled Test',
        description: '',
        creatorId: currentUser.uid,
        questions: [],
      });
      navigate(`/create/editor/${newTestId}`);
    } catch (err) {
      console.error('Error creating test', err);
      alert('Could not create test. Please try again.');
    }
  };

  const deleteTest = async (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await firestoreService.deleteCustomTest(testId);
      setTests(prev => prev.filter(t => t.id !== testId));
    } catch (err) {
      console.error('Error deleting test', err);
      alert('Could not delete test. Please try again.');
    }
  };

  if (loading) return <PageLoadingScreen loading={true} />;

  return (
    <div className="create-dashboard" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Test Creation</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Start a new test or revisit your current drafts.</p>
      </div>

      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Your Work</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Create a new test or open a saved draft.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {/* Create New Card */}
          <div 
            onClick={createNewTest}
            style={{
              background: 'var(--bg-white)',
              border: '2px dashed var(--border)',
              borderRadius: '16px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              minHeight: '200px',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '16px'
            }}>
              <Plus size={24} />
            </div>
            <span style={{ fontWeight: 600 }}>Create a test</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Start from scratch or import</span>
          </div>

          {/* Existing Tests */}
          {tests.map(test => (
            <div 
              key={test.id}
              onClick={() => navigate(`/create/editor/${test.id}`)}
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                minHeight: '200px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--card-shadow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '18px', paddingRight: '24px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {test.title || 'Untitled Test'}
                </h3>
                <button 
                  onClick={(e) => deleteTest(e, test.id!)}
                  style={{ 
                    position: 'absolute', top: '24px', right: '24px',
                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Delete Test"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px', flex: 1 }}>
                {test.description || 'No description provided.'}
              </p>
              <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={14} />
                {test.questions.length} questions
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
