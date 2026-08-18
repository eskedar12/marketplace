import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { CATEGORY_VISUALS } from '../../utils/categoryIcons.jsx';
import Button from '../common/Button.jsx';

// The three categories always shown as direct links next to the
// "Categories" dropdown, matching the reference design.
const QUICK_LINKS = ['Electronics', 'Fashion', 'Vehicles'];

// A single icon-only nav link used for the role-specific controls on the
// right side of the navbar (Favorites/My Listings, Notifications, Profile).
function NavIconLink({ to, label, children }) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className="p-2 text-ink/70 hover:text-mustard hover:bg-mustard/5 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}

// Same as NavIconLink but renders the user's profile picture instead of an
// icon when one is set, so the avatar sits in the same slot the icon would.
function NavAvatarLink({ to, label, imageUrl, children }) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className="p-1.5 text-ink/70 hover:text-mustard rounded-lg transition-colors"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className="w-7 h-7 rounded-full object-cover border border-line"
        />
      ) : (
        <span className="p-0.5 block">{children}</span>
      )}
    </Link>
  );
}

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
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-2xl tracking-tight flex-shrink-0">
          <svg
            className="w-8 h-8 flex-shrink-0"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="9" className="fill-mustard" />
            <path
              d="M6.5 13.5Q9.2 9.5 12 13.5Q14.8 9.5 17.5 13.5Q20.2 9.5 22 12.5"
              stroke="white"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 13.5V21Q8 22 9 22H23Q24 22 24 21V13.5"
              stroke="white"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="13.5" y1="17" x2="13.5" y2="22" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="18.5" y1="17" x2="18.5" y2="22" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>
            <span className="text-mustard">Re</span>
            <span className="text-ink">Gebeya</span>
          </span>
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
              {/* Role-specific icon: Favorites for buyers, My Listings for sellers */}
              {user.role === 'seller' ? (
                <NavIconLink to="/my-listings" label="My Listings">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </NavIconLink>
              ) : (
                <>
                  <NavIconLink to="/favorites" label="Favorites">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </NavIconLink>
                  <NavIconLink to="/cart" label="Cart">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.98-4.706 2.55-7.199.078-.341-.195-.657-.546-.657H5.106M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </NavIconLink>
                </>
              )}

              <NavIconLink to="/messages" label="Messages">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </NavIconLink>

              <NavIconLink to="/notifications" label="Notifications">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </NavIconLink>

              <NavAvatarLink to="/profile" label="Profile" imageUrl={user.profile_image}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </NavAvatarLink>

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

          {(!user || user.role === 'seller') && (
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
          )}
        </div>
      </div>
    </header>
  );
}
