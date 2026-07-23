import { useState, useEffect } from 'react';
import { X, Send, BookOpen, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, type Team, type CustomTest } from '../services/firestoreService';

interface ShareTestModalProps {
  test: CustomTest;
  onClose: () => void;
  onShared?: () => void;
}

export default function ShareTestModal({ test, onClose, onShared }: ShareTestModalProps) {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [shareType, setShareType] = useState<'stream' | 'assignment'>('stream');
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentUser) loadTeams();
  }, [currentUser]);

  const loadTeams = async () => {
    if (!currentUser) return;
    try {
      const userTeams = await firestoreService.getUserTeams(currentUser.uid);
      setTeams(userTeams);
      if (userTeams.length > 0) setSelectedTeamId(userTeams[0].id);
    } catch (err) {
      console.error('Failed to load teams', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentUser || !selectedTeamId || !test.id) return;
    setSaving(true);
    try {
      // Make test public so team members can access it
      if (!test.isPublic) {
        await firestoreService.updateCustomTest(test.id, { isPublic: true });
      }

      if (shareType === 'stream') {
        const content = message.trim() || `Check out this test: **${test.title}**`;
        await firestoreService.addStreamMessage(
          selectedTeamId,
          currentUser.uid,
          currentUser.displayName || 'Unknown User',
          content,
          test.id,
          test.title
        );
      } else {
        await firestoreService.addAssignment(selectedTeamId, {
          title: `Test: ${test.title}`,
          description: message.trim() || (test.description || 'Complete this custom test.'),
          dueDate: dueDate,
          customTestId: test.id,
        });
      }

      setDone(true);
      if (onShared) onShared();
    } catch (err) {
      console.error('Error sharing test', err);
      alert('Failed to share test. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const teamName = teams.find(t => t.id === selectedTeamId)?.name ?? '';

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-white)', width: '90%', maxWidth: '480px',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        animation: 'fadeInUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, var(--primary-color, #2563eb) 0%, #7c3aed 100%)',
          color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 size={20} />
            <div>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Share Test</h2>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>{test.title}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <h3 style={{ margin: '0 0 8px' }}>Shared Successfully!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                "{test.title}" has been {shareType === 'stream' ? 'posted to the stream of' : 'assigned to'} <strong>{teamName}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/teams"
                  style={{ padding: '10px 20px', background: 'var(--primary-color, #2563eb)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 500 }}
                  onClick={onClose}
                >
                  Go to Teams
                </Link>
                <button className="btn-secondary" onClick={onClose}>Close</button>
              </div>
            </div>
          ) : loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>Loading your teams...</p>
          ) : teams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: 'var(--text-secondary)' }}>You don't belong to any teams yet.</p>
              <Link to="/teams" style={{ color: 'var(--primary-color, #2563eb)' }} onClick={onClose}>Join or create a team →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Team selector */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Team</label>
                <select
                  value={selectedTeamId}
                  onChange={e => setSelectedTeamId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary, var(--bg-gray))', fontSize: '14px' }}
                >
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {/* Share type */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '14px' }}>Share as</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {(['stream', 'assignment'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setShareType(type)}
                      style={{
                        padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 500, fontSize: '14px',
                        border: shareType === type ? '2px solid var(--primary-color, #2563eb)' : '2px solid var(--border-color)',
                        background: shareType === type ? 'rgba(37,99,235,0.08)' : 'var(--bg-secondary, var(--bg-gray))',
                        color: shareType === type ? 'var(--primary-color, #2563eb)' : 'var(--text-primary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {type === 'stream' ? '💬 Stream Post' : '📋 Assignment'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  {shareType === 'stream' ? 'Message (optional)' : 'Instructions (optional)'}
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={shareType === 'stream'
                    ? `Check out this test: ${test.title}`
                    : 'Please complete this test by the due date...'
                  }
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Due date for assignment */}
              {shareType === 'assignment' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                  />
                </div>
              )}

              {/* Privacy notice */}
              <div style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                background: 'rgba(37,99,235,0.07)', padding: '12px 14px', borderRadius: '10px',
                fontSize: '13px', color: 'var(--text-secondary)',
              }}>
                <BookOpen size={16} style={{ flexShrink: 0, marginTop: '1px', color: 'var(--primary-color, #2563eb)' }} />
                <span>Sharing will automatically make this test <strong>public</strong> so team members can take it.</span>
              </div>
            </div>
          )}
        </div>

        {!done && !loading && teams.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleShare}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {saving ? 'Sharing…' : <><Send size={15} /> Share to {teamName}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
