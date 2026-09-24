import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This guard only hides the UI. Real authorization is enforced server-side
// via Firebase custom claims checked in Firestore/Storage security rules.
export default function AdminRoute() {
  const { user, isAdmin, authLoading } = useAuth();

  if (authLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
