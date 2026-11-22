import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { firestoreService } from '../services/firestoreService';
import { BootSplash } from '../components/PageLoadingScreen';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Remembered between visits so a returning user sees a splash instead of a landing-page flash. */
const SIGNED_IN_HINT = 'sciolytics:signedIn';

function hadSession() {
  try { return localStorage.getItem(SIGNED_IN_HINT) === '1'; } catch { return false; }
}

// Errors where a popup can't work (blocked, in-app browsers, iOS standalone) → fall back to redirect.
const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/web-storage-unsupported',
]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      // Render immediately — profile sync must never block the UI (this was the
      // "login reloading" bug: every refresh waited on a Firestore write first).
      setLoading(false);
      try {
        if (user) localStorage.setItem(SIGNED_IN_HINT, '1');
        else localStorage.removeItem(SIGNED_IN_HINT);
      } catch { /* storage unavailable */ }
      if (user) {
        firestoreService.syncUserAuthData(user).catch(err =>
          console.error('Failed to sync user auth data:', err)
        );
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const code = (error as { code?: string })?.code ?? '';
      if (POPUP_FALLBACK_CODES.has(code)) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = { currentUser, loading, signInWithGoogle, logout };

  // Public pages can render while auth resolves, unless we know this browser
  // had a session (then a brief splash avoids flashing the logged-out UI).
  const blockForAuth = loading && hadSession();

  return (
    <AuthContext.Provider value={value}>
      {blockForAuth ? <BootSplash /> : children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
