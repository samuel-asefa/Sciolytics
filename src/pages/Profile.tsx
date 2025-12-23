import { useState, useEffect } from 'react';
import { User, Mail, Calendar, MapPin, School, Save, Edit2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';

interface UserProfile {
  fullName: string;
  location: string;
  school: string;
  graduationYear: string;
  bio: string;
}

export default function Profile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      fullName: '',
      location: '',
      school: '',
      graduationYear: '',
      bio: '',
    };
  });

  const [formData, setFormData] = useState<UserProfile>(profile);

  useEffect(() => {
    if (currentUser?.displayName) {
      setProfile(prev => ({
        ...prev,
        fullName: currentUser.displayName || prev.fullName,
      }));
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.displayName || prev.fullName,
      }));
    }
  }, [currentUser]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      // Update Firebase profile if display name changed
      if (currentUser && formData.fullName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.fullName,
        });
      }

      setProfile(formData);
      localStorage.setItem('userProfile', JSON.stringify(formData));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const email = currentUser?.email || '';
  const photoURL = currentUser?.photoURL || '';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
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
              <label className="form-label">
                <User size={18} />
                Username
              </label>
              <div className="form-display">{displayName}</div>
            </div>

            <div className="form-section">
              <label className="form-label">
                <Mail size={18} />
                Email
              </label>
              <div className="form-display">{email}</div>
              <p className="form-hint">Email is managed by your authentication provider</p>
            </div>

            <div className="form-section">
              <label className="form-label">
                <User size={18} />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="form-input"
                  placeholder={displayName}
                />
              ) : (
                <div className="form-display">{profile.fullName || displayName}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">
                <MapPin size={18} />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="form-input"
                  placeholder="City, State, Country"
                />
              ) : (
                <div className="form-display">{profile.location || 'Not set'}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">
                <School size={18} />
                School
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => handleChange('school', e.target.value)}
                  className="form-input"
                />
              ) : (
                <div className="form-display">{profile.school || 'Not set'}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">
                <Calendar size={18} />
                Graduation Year
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.graduationYear}
                  onChange={(e) => handleChange('graduationYear', e.target.value)}
                  className="form-input"
                  placeholder="2026"
                />
              ) : (
                <div className="form-display">{profile.graduationYear || 'Not set'}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <div className="form-display">{profile.bio || 'No bio set'}</div>
              )}
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button className="btn-secondary" onClick={handleCancel}>
                    <X size={18} />
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSave}>
                    <Save size={18} />
                    Save Changes
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">Tests Completed</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">Questions Answered</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">0%</div>
              <div className="stat-label">Average Accuracy</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">Bookmarks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
