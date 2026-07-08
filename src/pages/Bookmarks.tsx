import { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type BookmarkedQuestion } from '../services/firestoreService';

export default function Bookmarks() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';

  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    firestoreService.getBookmarks(uid)
      .then(bmarks => {
        const sorted = bmarks.sort((a, b) => {
          const aTime = (a.bookmarkedAt as any)?.seconds ?? 0;
          const bTime = (b.bookmarkedAt as any)?.seconds ?? 0;
          return bTime - aTime;
        });
        setBookmarks(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [uid]);

  const handleRemove = async (questionId: string) => {
    const question = bookmarks.find(b => b.id === questionId);
    if (!question || !uid) return;
    await firestoreService.toggleBookmark(uid, question);
    setBookmarks(prev => prev.filter(b => b.id !== questionId));
  };

  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1>Bookmarks</h1>
        <p>Questions you've bookmarked during practice — review them any time.</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading your bookmarks…
        </div>
      ) : bookmarks.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ margin: '0 0 8px' }}>No bookmarks yet</h3>
          <p style={{ fontSize: '14px' }}>
            While practicing, click the <BookmarkIcon size={14} style={{ display: 'inline' }} /> icon on any question to save it here.
          </p>
          <Link to="/practice" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', textDecoration: 'none' }}>
            Go Practice
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{bookmarks.length} saved question{bookmarks.length !== 1 ? 's' : ''}</p>
          {bookmarks.map(q => (
            <div
              key={q.id}
              className="event-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}
            >
              <div style={{ flex: 1 }}>
                <div className="event-name" style={{ marginBottom: '8px', fontSize: '15px', lineHeight: 1.5 }}>
                  {q.question}
                </div>
                <div className="event-tags">
                  <span className="tag category">{q.event}</span>
                  <span className="tag category">{q.subtopic}</span>
                  <span className="tag division">{q.type}</span>
                  <span className="tag category" style={{
                    color: q.difficulty === 'Hard' ? '#ef4444' : q.difficulty === 'Medium' ? '#f59e0b' : '#10b981'
                  }}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRemove(q.id)}
                title="Remove bookmark"
                style={{
                  background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                  padding: '4px', flexShrink: 0, opacity: 0.7, transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
