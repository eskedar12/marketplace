import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { CATEGORY_VISUALS } from '../../utils/categoryIcons.jsx';
import Button from '../common/Button.jsx';

// The three categories always shown as direct links next to the
// "Categories" dropdown, matching the reference design.
const QUICK_LINKS = ['Electronics', 'Fashion', 'Vehicles'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <header className="bg-white sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center font-display font-extrabold text-2xl tracking-tight flex-shrink-0">
          <span className="text-mustard">Re</span>
          <span className="text-ink">Gebeya</span>
        </Link>

        {/* Center nav: Categories dropdown + quick links */}
        <nav className="hidden md:flex items-center gap-1" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-body font-medium rounded-lg transition-colors ${
                menuOpen ? 'text-mustard bg-mustard/5' : 'text-ink/80 hover:text-mustard'
              }`}
            >
              Categories
              <svg
                className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-line p-2 grid grid-cols-1"
              >
                {CATEGORY_VISUALS.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/?category=${cat.dbSlug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-paper transition-colors"
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.bg} ${cat.fg}`}>
                      {cat.icon('w-[18px] h-[18px]')}
                    </span>
                    <span className="text-sm font-body font-medium text-ink">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {QUICK_LINKS.map((name) => {
            const slug = CATEGORY_VISUALS.find((c) => c.name === name)?.dbSlug || name.toLowerCase();
            return (
              <Link
                key={name}
                to={`/?category=${slug}`}
                className="px-3 py-2 text-sm font-body font-medium text-ink/80 hover:text-mustard transition-colors"
              >
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Right side: auth + sell */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link to="/messages" className="hidden sm:inline px-2 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Messages
              </Link>
              <Link to="/my-listings" className="hidden sm:inline px-2 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                My listings
              </Link>
              <Link to="/profile" className="hidden sm:inline px-2 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="hidden sm:inline px-2 py-2 text-sm font-body text-ink/60 hover:text-clay transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2 sm:px-3 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="hidden sm:inline px-3 py-2 text-sm font-body text-ink/80 hover:text-mustard font-medium transition-colors">
                Register
              </Link>
            </>
          )}

          <Button
            as={Link}
            to="/sell"
            variant="accent"
            className="flex items-center gap-1.5 px-5 py-2.5 shadow-sm hover:shadow-md transition-all text-white font-display font-bold tracking-wide rounded-xl text-xs uppercase"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Sell
          </Button>
        </div>
      </div>
    </header>
  );
}
