import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — wraps routes that require auth
 * @param {string} requiredRole — 'Admin' | 'Agent' | null (any authenticated)
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 size={24} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role guard: if 'Admin' required, check isAdmin
  if (requiredRole === 'Admin' && !isAdmin) {
    return <Navigate to="/agent" replace />;
  }

  // Role guard: if 'Agent' required but user is Admin, send to admin dashboard
  if (requiredRole === 'Agent' && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
