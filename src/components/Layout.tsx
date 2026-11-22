import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Settings, LogOut, Bell, CheckCircle2, Calendar, ClipboardList, ChevronDown, Menu, X,
  Search, Moon, Sun, BookOpen, Layers, FileText, Bookmark, HelpCircle, Info, Mail, HeartHandshake,
  LayoutDashboard, PenTool, BarChart3, Users, Globe, PlusSquare, Handshake,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BackgroundRenderer from './BackgroundRenderer';
import CommandPalette from './CommandPalette';
import Logo from './Logo';
import { notificationService } from '../services/notificationService';
import type { AppNotification } from '../services/notificationService';
import '../styles/layout.css';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem { to: string; label: string; icon: typeof User; desc?: string }

const PRIMARY: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'Practice', icon: PenTool },
];

const STUDY: NavItem[] = [
  { to: '/wiki', label: 'Event Wiki', icon: BookOpen, desc: 'Rules, notes & reference for every event' },
  { to: '/flashcards', label: 'Flashcards', icon: Layers, desc: 'Spaced-repetition decks from real questions' },
  { to: '/cheatsheets', label: 'Cheat Sheets', icon: FileText, desc: 'Build print-ready note sheets' },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark, desc: 'Questions you saved for later' },
];

const SECONDARY: NavItem[] = [
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/community', label: 'Community', icon: Globe },
  { to: '/create', label: 'Create', icon: PlusSquare },
];

const MORE: NavItem[] = [
  { to: '/partner', label: 'Partner Mode', icon: Handshake },
  { to: '/help', label: 'Help & FAQ', icon: HelpCircle },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
  { to: '/join', label: 'Join the team', icon: HeartHandshake },
];

/** Routes that should feel full-focus (no footer). */
const FOCUS_ROUTES = ['/practice/test', '/test/', '/partner/'];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();

  const [openMenu, setOpenMenu] = useState<null | 'study' | 'user' | 'notifs'>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const syncedUidRef = useRef<string>('');

  // Close menus on route change
  useEffect(() => {
    setOpenMenu(null);
    setDrawerOpen(false);
  }, [location.pathname]);

  // Real-time notifications + one-time team sync per session
  useEffect(() => {
    if (!currentUser) return;
    let unsubscribe = () => {};
    try {
      unsubscribe = notificationService.subscribe(currentUser.uid, setNotifications);
    } catch (err) {
      console.error(err);
    }
    if (syncedUidRef.current !== currentUser.uid) {
      syncedUidRef.current = currentUser.uid;
      notificationService.syncFromTeamActivity(currentUser.uid).catch(console.error);
    }
    return () => unsubscribe();
  }, [currentUser]);

  // Click outside closes dropdowns
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // ⌘K / Ctrl+K / "/" opens the command palette; Esc closes menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === 'Escape') {
        setOpenMenu(null);
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllRead(currentUser.uid);
  };

  const handleNotifClick = async (notif: AppNotification) => {
    if (!currentUser) return;
    if (!notif.read) await notificationService.markRead(currentUser.uid, notif.id);
    setOpenMenu(null);
    if (notif.teamId) navigate('/teams');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const userInitials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0].toUpperCase() || 'U';

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'team': return <User size={15} />;
      case 'assignment': return <ClipboardList size={15} />;
      case 'event': return <Calendar size={15} />;
      default: return <Bell size={15} />;
    }
  };

  const notifTint: Record<string, string> = {
    team: '#10b981', assignment: '#f59e0b', event: '#8b5cf6', system: '#3b82f6',
  };

  const studyActive = STUDY.some(s => location.pathname.startsWith(s.to));
  const isFocus = FOCUS_ROUTES.some(r => location.pathname.startsWith(r));
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  const linkClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <div className="layout">
      <BackgroundRenderer />
      <a href="#main" className="skip-link">Skip to content</a>

      <header ref={navRef} className={`app-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="app-nav-inner">
          <div className="nav-left">
            <button
              className="nav-icon-btn nav-burger"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Link to={currentUser ? '/dashboard' : '/'} className="logo-container" aria-label="Sciolytics home">
              <Logo size={30} />
            </Link>
          </div>

          <nav className="nav-center" aria-label="Primary">
            {currentUser ? (
              <>
                {PRIMARY.map(item => (
                  <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/practice'}>
                    {item.label}
                  </NavLink>
                ))}
                <div className="nav-dropdown">
                  <button
                    className={`nav-link${studyActive ? ' active' : ''}`}
                    aria-expanded={openMenu === 'study'}
                    onClick={() => setOpenMenu(openMenu === 'study' ? null : 'study')}
                  >
                    Study <ChevronDown size={14} className={`chev${openMenu === 'study' ? ' open' : ''}`} />
                  </button>
                  {openMenu === 'study' && (
                    <div className="nav-popover nav-mega">
                      {STUDY.map(item => (
                        <Link key={item.to} to={item.to} className="mega-item">
                          <span className="mega-icon"><item.icon size={17} /></span>
                          <span>
                            <span className="mega-title">{item.label}</span>
                            <span className="mega-desc">{item.desc}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {SECONDARY.map(item => (
                  <NavLink key={item.to} to={item.to} className={linkClass}>
                    {item.label}
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                <NavLink to="/wiki" className={linkClass}>Event Wiki</NavLink>
                <Link to="/#features" className="nav-link">Features</Link>
                <Link to="/#faq" className="nav-link">FAQ</Link>
                <NavLink to="/about" className={linkClass}>About</NavLink>
              </>
            )}
          </nav>

          <div className="nav-right">
            <button className="nav-search" onClick={() => setPaletteOpen(true)} aria-label="Search (Command K)">
              <Search size={15} />
              <span className="nav-search-label">Search</span>
              <span className="nav-search-kbd"><kbd className="ui-kbd">{isMac ? '⌘' : 'Ctrl'}</kbd><kbd className="ui-kbd">K</kbd></span>
            </button>

            <button
              className="nav-icon-btn"
              onClick={toggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {currentUser ? (
              <>
                <div className="nav-dropdown">
                  <button
                    className="nav-icon-btn"
                    aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
                    onClick={() => setOpenMenu(openMenu === 'notifs' ? null : 'notifs')}
                  >
                    <Bell size={18} />
                    {unread > 0 && <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>}
                  </button>
                  {openMenu === 'notifs' && (
                    <div className="nav-popover nav-notifs align-right">
                      <div className="notifs-head">
                        <h3>Notifications</h3>
                        {unread > 0 && <button onClick={markAllRead}>Mark all read</button>}
                      </div>
                      <div className="notifs-list">
                        {notifications.length > 0 ? notifications.map(notif => (
                          <button
                            key={notif.id}
                            className={`notif-item${notif.read ? '' : ' unread'}`}
                            onClick={() => handleNotifClick(notif)}
                          >
                            <span className="notif-icon" style={{ color: notifTint[notif.type] ?? '#3b82f6', background: `color-mix(in srgb, ${notifTint[notif.type] ?? '#3b82f6'} 12%, transparent)` }}>
                              {getNotifIcon(notif.type)}
                            </span>
                            <span className="notif-body">
                              <span className="notif-title-row">
                                <span className="notif-title">{notif.title}</span>
                                <span className="notif-time">{notif.time}</span>
                              </span>
                              <span className="notif-msg">{notif.message}</span>
                            </span>
                          </button>
                        )) : (
                          <div className="notifs-empty">
                            <CheckCircle2 size={28} />
                            <span>You're all caught up</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="nav-dropdown">
                  <button
                    className="user-chip"
                    aria-label="Account menu"
                    aria-expanded={openMenu === 'user'}
                    onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="user-avatar-img" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="user-avatar">{userInitials}</span>
                    )}
                    <ChevronDown size={14} className={`chev${openMenu === 'user' ? ' open' : ''}`} />
                  </button>
                  {openMenu === 'user' && (
                    <div className="nav-popover nav-user align-right">
                      <div className="user-card">
                        <span className="user-card-name">{displayName}</span>
                        <span className="user-card-email">{currentUser.email}</span>
                      </div>
                      <Link to="/profile" className="menu-item"><User size={16} />Profile</Link>
                      <Link to="/settings" className="menu-item"><Settings size={16} />Settings</Link>
                      <div className="menu-divider" />
                      {MORE.map(item => (
                        <Link key={item.to} to={item.to} className="menu-item"><item.icon size={16} />{item.label}</Link>
                      ))}
                      <div className="menu-divider" />
                      <button className="menu-item danger" onClick={handleLogout}><LogOut size={16} />Log out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" state={{ from: location.pathname }} className="ui-btn ui-btn-ink ui-btn-sm nav-signin">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <aside className="drawer" onClick={e => e.stopPropagation()} aria-label="Menu">
            <div className="drawer-head">
              <Logo size={28} />
              <button className="nav-icon-btn" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <button className="drawer-search" onClick={() => { setDrawerOpen(false); setPaletteOpen(true); }}>
              <Search size={16} /> Search events, pages, actions…
            </button>
            {currentUser ? (
              <>
                <DrawerGroup title="Train" items={[...PRIMARY, ...SECONDARY.slice(0, 1)]} />
                <DrawerGroup title="Study" items={STUDY} />
                <DrawerGroup title="Together" items={[...SECONDARY.slice(1), MORE[0]]} />
                <DrawerGroup title="Sciolytics" items={MORE.slice(1)} />
                <div className="drawer-foot">
                  <Link to="/settings" className="menu-item"><Settings size={16} />Settings</Link>
                  <button className="menu-item danger" onClick={handleLogout}><LogOut size={16} />Log out</button>
                </div>
              </>
            ) : (
              <>
                <DrawerGroup title="Explore" items={[STUDY[0], ...MORE.slice(1)]} />
                <div className="drawer-foot">
                  <Link to="/login" className="ui-btn ui-btn-primary" style={{ width: '100%' }}>Sign in with Google</Link>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <main id="main" className="main-content">
        {children}
      </main>

      {!isFocus && (
        <footer className="app-footer">
          <div className="app-footer-inner">
            <span className="app-footer-brand">
              <Logo size={20} />
              <span className="ui-muted">© {new Date().getFullYear()}</span>
            </span>
            <nav className="app-footer-links" aria-label="Footer">
              <Link to="/wiki">Wiki</Link>
              <Link to="/help">Help</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/join">Join us</Link>
            </nav>
            <span className="app-footer-note">Not affiliated with or endorsed by Science Olympiad, Inc.</span>
          </div>
        </footer>
      )}
    </div>
  );
}

function DrawerGroup({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="drawer-group">
      <span className="drawer-group-title">{title}</span>
      {items.map(item => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `drawer-link${isActive ? ' active' : ''}`}>
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
