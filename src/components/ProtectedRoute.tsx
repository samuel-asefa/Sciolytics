import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import PageLoadingScreen from './PageLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading: authLoading } = useAuth();
  const { loaded: dataLoaded } = useUserData();

  // Show loading screen while auth resolves OR initial data is being fetched
  const isLoading = authLoading || (!!currentUser && !dataLoaded);

  if (isLoading) {
    return <PageLoadingScreen loading={true} />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
