import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  // Some routes (e.g. /sell) are restricted to a single role. A logged-in
  // user of the wrong role gets bounced home with an explanatory message
  // instead of silently seeing (or being able to submit) a form the
  // backend will reject anyway.
  if (role && user.role !== role) {
    return (
      <Navigate
        to="/"
        state={{ message: `Only ${role} accounts can access that page.` }}
        replace
      />
    );
  }

  return children;
}
