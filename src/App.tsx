import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import PracticeTest from './pages/PracticeTest';
import PracticeResults from './pages/PracticeResults';
import Analytics from './pages/Analytics';
import Teams from './pages/Teams';
import UpcomingEvents from './pages/UpcomingEvents';
import Profile from './pages/Profile';
import Help from './pages/Help';
import Bookmarks from './pages/Bookmarks';
import LoadTest from './pages/LoadTest';
import Resources from './pages/Resources';
import Wiki from './pages/Wiki';
import EventWiki from './pages/EventWiki';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice"
                  element={
                    <ProtectedRoute>
                      <Practice />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice/test"
                  element={
                    <ProtectedRoute>
                      <PracticeTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice/results"
                  element={
                    <ProtectedRoute>
                      <PracticeResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams"
                  element={
                    <ProtectedRoute>
                      <Teams />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upcoming"
                  element={
                    <ProtectedRoute>
                      <UpcomingEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <Help />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resources"
                  element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wiki"
                  element={
                    <ProtectedRoute>
                      <Wiki />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wiki/:eventId"
                  element={
                    <ProtectedRoute>
                      <EventWiki />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute>
                      <Bookmarks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/load-test"
                  element={
                    <ProtectedRoute>
                      <LoadTest />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
