import { useState, useEffect } from 'react';
import { User, Mail, Calendar, MapPin, School, Save, Edit2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { firestoreService } from '../services/firestoreService';

interface UserProfile {
  fullName: string;
  location: string;
  school: string;
  graduationYear: string;
  bio: string;
}

const defaultProfile: UserProfile = { fullName: '', location: '', school: '', graduationYear: '', bio: '' };

export default function Profile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [formData, setFormData] = useState<UserProfile>(defaultProfile);
  const [firestoreStats, setFirestoreStats] = useState({ questionsAnswered: 0, accuracy: 0, bookmarks: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    firestoreService.getProfile(currentUser.uid).then(p => {
      const loaded: UserProfile = {
        fullName: (p.fullName as string) || currentUser.displayName || '',
        location: (p.location as string) || '',
        school: (p.school as string) || '',
        graduationYear: (p.graduationYear as string) || '',
        bio: (p.bio as string) || '',
      };
      setProfile(loaded);
      setFormData(loaded);
    }).catch(console.error);

    firestoreService.getProgress(currentUser.uid).then(prog => {
      setFirestoreStats(prev => ({ ...prev, questionsAnswered: prog.questionsAnswered, accuracy: prog.accuracy }));
    }).catch(console.error);

    firestoreService.getBookmarks(currentUser.uid).then(bmarks => {
      setFirestoreStats(prev => ({ ...prev, bookmarks: bmarks.length }));
    }).catch(console.error);
  }, [currentUser]);

  const handleChange = (field: keyof UserProfile, value: string) => setFormData({ ...formData, [field]: value });

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    try {
      await firestoreService.saveProfile(currentUser.uid, formData as unknown as Record<string, string>);
      if (formData.fullName && formData.fullName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: formData.fullName });
      }
      setProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setFormData(profile); setIsEditing(false); };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const email = currentUser?.email || '';
  const photoURL = currentUser?.photoURL || '';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </div>
            {isEditing && (
              <button className="avatar-upload-btn">
                <Edit2 size={16} />
                Change Photo
              </button>
            )}
          </div>

          <div className="profile-form">
            <div className="form-section">
              <label className="form-label"><User size={18} />Username</label>
              <div className="form-display">{displayName}</div>
            </div>

            <div className="form-section">
              <label className="form-label"><Mail size={18} />Email</label>
              <div className="form-display">{email}</div>
              <p className="form-hint">Email is managed by your authentication provider</p>
            </div>

            <div className="form-section">
              <label className="form-label"><User size={18} />Full Name</label>
              {isEditing ? (
                <input type="text" value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} className="form-input" placeholder={displayName} />
              ) : (
                <div className="form-display">{profile.fullName || displayName}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label"><MapPin size={18} />Location</label>
              {isEditing ? (
                <input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} className="form-input" placeholder="City, State, Country" />
              ) : (
                <div className="form-display">{profile.location || 'Not set'}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label"><School size={18} />School</label>
              {isEditing ? (
                <input type="text" value={formData.school} onChange={e => handleChange('school', e.target.value)} className="form-input" />
              ) : (
                <div className="form-display">{profile.school || 'Not set'}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label"><Calendar size={18} />Graduation Year</label>
              {isEditing ? (
                <input type="text" value={formData.graduationYear} onChange={e => handleChange('graduationYear', e.target.value)} className="form-input" placeholder="2026" />
              ) : (
                <div className="form-display">{profile.graduationYear || 'Not set'}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Bio</label>
              {isEditing ? (
                <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className="form-textarea" rows={4} placeholder="Tell us about yourself..." />
              ) : (
                <div className="form-display">{profile.bio || 'No bio set'}</div>
              )}
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button className="btn-secondary" onClick={handleCancel} disabled={saving}>
                    <X size={18} />Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />{saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={18} />Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">{firestoreStats.questionsAnswered}</div>
              <div className="stat-label">Questions Answered</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{firestoreStats.accuracy}%</div>
              <div className="stat-label">Overall Accuracy</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{firestoreStats.bookmarks}</div>
              <div className="stat-label">Bookmarks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
