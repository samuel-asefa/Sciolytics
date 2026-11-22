import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark as BookmarkIcon, Trash2, Eye, EyeOff, Play, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type BookmarkedQuestion } from '../services/firestoreService';
import { studyService } from '../services/studyService';
import { useToast } from '../components/Toast';
import PageLoadingScreen from '../components/PageLoadingScreen';
import { eventMeta } from '../lib/events';
import type { Timestamp } from 'firebase/firestore';

export default function Bookmarks() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const uid = currentUser?.uid ?? '';
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [eventFilter, setEventFilter] = useState('All');

  useEffect(() => {
    if (!uid) return;
    firestoreService.getBookmarks(uid)
      .then(b => setBookmarks(b.sort((x, y) => ((y.bookmarkedAt as Timestamp)?.seconds ?? 0) - ((x.bookmarkedAt as Timestamp)?.seconds ?? 0))))
      .catch(err => { console.error(err); toast('Could not load bookmarks', 'error'); })
      .finally(() => setLoading(false));
  }, [uid, toast]);

  const events = useMemo(() => Array.from(new Set(bookmarks.map(b => b.event))).sort(), [bookmarks]);
  const visible = bookmarks.filter(b => eventFilter === 'All' || b.event === eventFilter);

  const remove = async (q: BookmarkedQuestion) => {
    setBookmarks(prev => prev.filter(b => b.id !== q.id));
    try { await firestoreService.toggleBookmark(uid, q); toast('Bookmark removed'); }
    catch { setBookmarks(prev => [q, ...prev]); toast('Could not remove bookmark', 'error'); }
  };

  const practice = () => {
    sessionStorage.setItem('testConfig', JSON.stringify({ ids: visible.map(b => b.id) }));
    sessionStorage.setItem('timeLimit', String(Math.max(5, visible.length)));
    sessionStorage.removeItem('unlimitedMode');
    sessionStorage.setItem('unansweredOnly', 'false');
    navigate('/practice/test');
  };

  const toCards = async () => {
    await studyService.markMissed(uid, visible.map(b => b.id));
    toast(`${visible.length} cards queued in your Mistakes deck`);
    navigate('/flashcards/mistakes');
  };

  if (loading) return <PageLoadingScreen loading label="Loading bookmarks" />;

  return (
    <div className="ui-page" style={{ maxWidth: 920 }}>
      <header className="ui-page-head">
        <div>
          <span className="ui-eyebrow"><BookmarkIcon size={13} /> Saved</span>
          <h1>Bookmarks</h1>
          <p>Questions you saved during practice. Press <kbd className="ui-kbd">M</kbd> in any test to bookmark.</p>
        </div>
        {visible.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="ui-btn ui-btn-outline" onClick={toCards}><Layers size={15} /> Flashcards</button>
            <button className="ui-btn ui-btn-primary" onClick={practice}><Play size={15} /> Practice {visible.length}</button>
          </div>
        )}
      </header>

      {bookmarks.length === 0 ? (
        <div className="ui-card ui-empty">
          <div className="ui-empty-icon"><BookmarkIcon size={24} /></div>
          <h3>No bookmarks yet</h3>
          <p>Tap the bookmark icon (or press M) on any question while practicing to save it here.</p>
          <Link to="/practice" className="ui-btn ui-btn-primary">Go practice</Link>
        </div>
      ) : (
        <>
          {events.length > 1 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <button className={`ui-chip${eventFilter === 'All' ? ' is-active' : ''}`} onClick={() => setEventFilter('All')}>All {bookmarks.length}</button>
              {events.map(e => (
                <button key={e} className={`ui-chip${eventFilter === e ? ' is-active' : ''}`} onClick={() => setEventFilter(e)}>
                  {e} {bookmarks.filter(b => b.event === e).length}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map(q => {
              const m = eventMeta(q.event);
              const open = revealed.has(q.id);
              return (
                <div key={q.id} className="ui-card" style={{ padding: 18, ['--ev' as string]: m.color }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0, color: m.color, background: `color-mix(in srgb, ${m.color} 12%, transparent)` }}>
                      <m.icon size={16} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 550, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{q.question}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        <span className="ui-chip">{q.event}</span>
                        {q.subtopic && <span className="ui-chip">{q.subtopic}</span>}
                        <span className={`ui-chip ${q.difficulty === 'Hard' ? 'ui-chip-danger' : q.difficulty === 'Easy' ? 'ui-chip-success' : 'ui-chip-warning'}`}>{q.difficulty}</span>
                      </div>
                      {open && (
                        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-gray)', animation: 'popIn .2s var(--ease-out)' }}>
                          <p style={{ fontWeight: 650, fontSize: 14 }}>{q.correctAnswer}</p>
                          {q.explanation && <p style={{ marginTop: 6, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.explanation}</p>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" title={open ? 'Hide answer' : 'Show answer'} onClick={() => setRevealed(s => { const n = new Set(s); if (open) n.delete(q.id); else n.add(q.id); return n; })}>
                        {open ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon" title="Remove bookmark" onClick={() => remove(q)}><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
