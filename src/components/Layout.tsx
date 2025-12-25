import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MoreVertical, User, Moon, Sun, X, Settings, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
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
      {showBanner && (
        <div className="top-banner">
          <span>
            This website is still in development!
            {' '}
            <a href="#" className="banner-link"></a>
          </span>
          <button className="banner-close" onClick={() => setShowBanner(false)}>
            <X size={16} />
          </button>
        </div>
      )}
      
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
          <Link to="/analytics" className={isActive('/analytics') ? 'nav-link active' : 'nav-link'}>
            Analytics
          </Link>
          <div className="nav-dropdown">
            <button className="nav-link" onClick={() => setShowMoreMenu(!showMoreMenu)}>
              More <MoreVertical size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </button>
            {showMoreMenu && (
              <div className="dropdown-menu">
                <Link to="/resources" className="dropdown-item">Resources</Link>
                <Link to="/help" className="dropdown-item">Help</Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
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
                <button className="dropdown-item">
                  <Settings size={16} />
                  Settings
                </button>
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
    </div>
  );
}
