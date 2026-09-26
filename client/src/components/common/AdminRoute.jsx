import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'Admin') {
    return <Navigate to="/account" replace />;
  }

  return children;
}
