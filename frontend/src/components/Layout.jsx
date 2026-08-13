import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-paper sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-700 text-2xl tracking-tight text-juniper">
            Zego
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <Link
                  to="/sell"
                  className="hidden sm:inline-block px-4 py-2 bg-mustard text-ink font-display font-600 text-sm hover:bg-mustard-dark transition-colors"
                >
                  Post an item
                </Link>
                <Link
                  to="/messages"
                  className="px-3 py-2 text-sm font-body text-ink/80 hover:text-ink"
                >
                  Messages
                </Link>
                <Link
                  to="/my-listings"
                  className="px-3 py-2 text-sm font-body text-ink/80 hover:text-ink"
                >
                  My listings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-3 py-2 text-sm font-body text-ink/60 hover:text-clay"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-body text-ink/80 hover:text-ink">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-juniper text-paper font-display font-600 text-sm hover:bg-juniper-dark transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-sm text-ink/50 font-body">
          Zego — a local marketplace for pre-owned goods. Built for the VinTech Challenge.
        </div>
      </footer>
    </div>
  );
}
