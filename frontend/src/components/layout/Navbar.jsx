import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';
import CategoryNav from './CategoryNav.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-line bg-white sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-700 text-2xl tracking-tight text-juniper hover:opacity-90 transition-opacity">
          <svg className="w-8 h-8 text-mustard" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="font-extrabold bg-gradient-to-r from-juniper to-juniper-light bg-clip-text text-transparent">ReGebeya</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Link to="/messages" className="px-3 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Messages
              </Link>
              <Link to="/my-listings" className="px-3 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                My listings
              </Link>
              <Link to="/profile" className="px-3 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3 py-2 text-sm font-body text-ink/60 hover:text-clay transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-3 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Register
              </Link>
            </>
          )}

          <Button
            as={Link}
            to="/sell"
            variant="accent"
            className="flex items-center gap-1.5 px-5 py-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white font-display font-bold uppercase tracking-wider rounded-lg text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Sell
          </Button>
        </nav>
      </div>

      {/* Category dropdown bar — pulls the 9 categories straight from the DB */}
      <CategoryNav />
    </header>
  );
}