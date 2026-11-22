import { lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoadingScreen from './components/PageLoadingScreen';
import { ToastProvider } from './components/Toast';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import './styles/polish.css';

// Route-level code splitting keeps the landing page light — the 700 KB
// question bank only loads once someone actually practices.
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Practice = lazy(() => import('./pages/Practice'));
const PracticeTest = lazy(() => import('./pages/PracticeTest'));
const PracticeResults = lazy(() => import('./pages/PracticeResults'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Teams = lazy(() => import('./pages/Teams'));
const UpcomingEvents = lazy(() => import('./pages/UpcomingEvents'));
const Profile = lazy(() => import('./pages/Profile'));
const Help = lazy(() => import('./pages/Help'));
const JoinUs = lazy(() => import('./pages/JoinUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const LoadTest = lazy(() => import('./pages/LoadTest'));
const CreateDashboard = lazy(() => import('./pages/CreateDashboard'));
const TestEditor = lazy(() => import('./pages/TestEditor'));
const TakeTest = lazy(() => import('./pages/TakeTest'));
const Community = lazy(() => import('./pages/Community'));
const Wiki = lazy(() => import('./pages/Wiki'));
const EventWiki = lazy(() => import('./pages/EventWiki'));
const Settings = lazy(() => import('./pages/Settings'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const FlashcardSession = lazy(() => import('./pages/FlashcardSession'));
const Cheatsheets = lazy(() => import('./pages/Cheatsheets'));
const CheatsheetEditor = lazy(() => import('./pages/CheatsheetEditor'));
const Partner = lazy(() => import('./pages/Partner'));
const PartnerSession = lazy(() => import('./pages/PartnerSession'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/practice': 'Practice',
  '/practice/test': 'Practice test',
  '/practice/results': 'Results',
  '/analytics': 'Analytics',
  '/teams': 'Teams',
  '/create': 'Create',
  '/community': 'Community tests',
  '/upcoming': 'Upcoming events',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/bookmarks': 'Bookmarks',
  '/wiki': 'Event Wiki',
  '/flashcards': 'Flashcards',
  '/cheatsheets': 'Cheat sheets',
  '/partner': 'Partner mode',
  '/help': 'Help & FAQ',
  '/about': 'About',
  '/contact': 'Contact',
  '/join': 'Join us',
};

/** Keeps document.title meaningful and resets scroll on navigation. */
function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const key = Object.keys(PAGE_TITLES)
      .sort((a, b) => b.length - a.length)
      .find(k => pathname === k || pathname.startsWith(k + '/'));
    document.title = key
      ? `${PAGE_TITLES[key]} · Sciolytics`
      : 'Sciolytics | Free Science Olympiad Practice Tests, Flashcards & Analytics';
  }, [pathname]);

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

/** Landing for visitors; signed-in users go straight to their dashboard. */
function Home() {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (currentUser) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from !== '/login' ? from : '/dashboard'} replace />;
  }
  return <Landing />;
}

const P = ({ children }: { children: ReactNode }) => <ProtectedRoute>{children}</ProtectedRoute>;

function App() {
  return (
    <Router>
      <ToastProvider>
        <RouteEffects />
        <Suspense fallback={<PageLoadingScreen loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Home />} />
            <Route
              path="/*"
              element={
                <Layout>
                  <Suspense fallback={<PageLoadingScreen loading />}>
                    <Routes>
                      {/* Public */}
                      <Route path="/wiki" element={<Wiki />} />
                      <Route path="/wiki/:eventId" element={<EventWiki />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/join" element={<JoinUs />} />

                      {/* Signed in */}
                      <Route path="/dashboard" element={<P><Dashboard /></P>} />
                      <Route path="/practice" element={<P><Practice /></P>} />
                      <Route path="/practice/test" element={<P><PracticeTest /></P>} />
                      <Route path="/practice/results" element={<P><PracticeResults /></P>} />
                      <Route path="/analytics" element={<P><Analytics /></P>} />
                      <Route path="/teams" element={<P><Teams /></P>} />
                      <Route path="/create" element={<P><CreateDashboard /></P>} />
                      <Route path="/create/editor/:testId" element={<P><TestEditor /></P>} />
                      <Route path="/community" element={<P><Community /></P>} />
                      <Route path="/test/:testId" element={<P><TakeTest /></P>} />
                      <Route path="/upcoming" element={<P><UpcomingEvents /></P>} />
                      <Route path="/profile" element={<P><Profile /></P>} />
                      <Route path="/settings" element={<P><Settings /></P>} />
                      <Route path="/bookmarks" element={<P><Bookmarks /></P>} />
                      <Route path="/load-test" element={<P><LoadTest /></P>} />
                      <Route path="/flashcards" element={<P><Flashcards /></P>} />
                      <Route path="/flashcards/:slug" element={<P><FlashcardSession /></P>} />
                      <Route path="/cheatsheets" element={<P><Cheatsheets /></P>} />
                      <Route path="/cheatsheets/:sheetId" element={<P><CheatsheetEditor /></P>} />
                      <Route path="/partner" element={<P><Partner /></P>} />
                      <Route path="/partner/:code" element={<P><PartnerSession /></P>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </ToastProvider>
    </Router>
  );
}

export default App;
