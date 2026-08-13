import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// Kept separate from AuthContext.jsx on purpose: components import the
// hook, never the context object directly, so the provider's internals
// can change without touching every file that reads `user`.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
