import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MoreVertical, User, Settings, LogOut, Bell, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BackgroundRenderer from './BackgroundRenderer';

interface LayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'team' | 'system';
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Team Message',
      message: 'Coach Smith: Practice is moved to 4 PM today.',
      time: '10m ago',
      read: false,
      type: 'team'
    },
    {
      id: '2',
      title: 'Tournament Update',
      message: 'The regional schedule has been posted.',
      time: '2h ago',
      read: false,
      type: 'system'
    }
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const userInitials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="layout">
      <BackgroundRenderer />
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/dashboard" className="logo-container">
            <div className="logo-icon"></div>
            <span className="logo-text">Sciolytics</span>
          </Link>
        </div>

        <div className="nav-center">
          <Link to="/practice" className={isActive('/practice') ? 'nav-link active' : 'nav-link'}>
            Practice
          </Link>
          <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </Link>
          <Link to="/teams" className={isActive('/teams') ? 'nav-link active' : 'nav-link'}>
            Teams
          </Link>
          <Link to="/wiki" className={isActive('/wiki') ? 'nav-link active' : 'nav-link'}>
            Wiki
          </Link>
          <Link to="/analytics" className={isActive('/analytics') ? 'nav-link active' : 'nav-link'}>
            Analytics
          </Link>
          <div className="nav-dropdown">
            <button className="nav-link" onClick={() => setShowMoreMenu(!showMoreMenu)}>
              More <MoreVertical size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </button>
            {showMoreMenu && (
              <div className="dropdown-menu">
                <Link to="/join" className="dropdown-item" onClick={() => setShowMoreMenu(false)}>Join Us</Link>
                <Link to="/contact" className="dropdown-item" onClick={() => setShowMoreMenu(false)}>Contact Us</Link>
                <Link to="/about" className="dropdown-item" onClick={() => setShowMoreMenu(false)}>About Us</Link>
                <Link to="/help" className="dropdown-item" onClick={() => setShowMoreMenu(false)}>Help</Link>
              </div>
            )}
          </div>
        </div>

        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notifications */}
          <div className="user-menu-container" ref={notificationsRef}>
            <button 
              className="nav-link" 
              style={{ padding: '8px', position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} color="var(--text-secondary)" />
              {notifications.some(n => !n.read) && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid var(--bg-nav)'
                }} />
              )}
            </button>

            {showNotifications && (
              <div className="dropdown-menu" style={{ width: '320px', right: '-60px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-white)' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</h3>
                  {notifications.some(n => !n.read) && (
                    <button 
                      onClick={markAllRead}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-white)' }}>
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border)',
                        background: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                      }}
                      onClick={() => {
                        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        setShowNotifications(false);
                      }}
                    >
                      <div style={{ marginTop: '2px', color: notif.type === 'team' ? '#10b981' : '#3b82f6' }}>
                        {notif.type === 'team' ? <User size={16} /> : <Bell size={16} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: notif.read ? 500 : 600, color: 'var(--text-primary)' }}>{notif.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{notif.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginTop: '6px' }} />
                      )}
                    </div>
                  )) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                      You're all caught up!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="user-menu-container" ref={userMenuRef}>
            <div className="user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="user-avatar-img" />
              ) : (
                <div className="user-avatar">
                  {userInitials}
                </div>
              )}
              <span className="username">{displayName}</span>
              <MoreVertical size={14} />
            </div>
            {showUserMenu && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <User size={16} />
                  Profile
                </button>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <Settings size={16} />
                  Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div >
  );
}
