import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button.jsx';

/**
 * RoleBasedUI Component
 * Renders role-specific marketplace controls for buyers and sellers,
 * or guest login prompts if not logged in.
 *
 * @param {Object} props
 * @param {Object} props.user - The logged-in user object with a 'role' property ('buyer' | 'seller')
 * @param {React.ReactNode} props.listings - The JSX containing listings to display
 * @param {Array} props.categories - Array of categories to display
 * @param {Function} props.onSearch - Callback function triggered on search query input
 * @param {Function} props.onContactSeller - Callback function triggered when contacting seller
 * @param {Function} props.onAddToFavorites - Callback function triggered when adding to favorites
 */
export default function RoleBasedUI({
  user,
  listings,
  categories = [],
  onSearch,
  onContactSeller,
  onAddToFavorites,
}) {
  // If user is null (not logged in), show login/signup prompts
  if (!user) {
    return (
      <div className="border border-line bg-white p-8 rounded-2xl shadow-sm text-center max-w-md mx-auto space-y-5 my-8">
        <div className="w-14 h-14 bg-mustard/10 text-mustard rounded-full flex items-center justify-center mx-auto border border-mustard/20">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-extrabold text-xl text-ink">Welcome to ReGebeya</h3>
          <p className="text-sm font-body text-ink/60 mt-1">
            Log in or sign up to browse items, message sellers, or post your own listings.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button as={Link} to="/login" variant="outline" className="flex-1 rounded-xl py-2.5">
            Log in
          </Button>
          <Button as={Link} to="/register" variant="primary" className="flex-1 rounded-xl py-2.5 text-white">
            Sign up
          </Button>
        </div>
      </div>
    );
  }

  const { role } = user; // 'buyer' or 'seller'

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto px-4 py-6">
      {/* 1. Header Control Panel (Search + Category Bar + Seller Actions) */}
      <div className="bg-white border border-line p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar (Both roles see) */}
          <div className="flex-1 flex items-center gap-2 border border-line rounded-xl px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-juniper focus-within:ring-2 focus-within:ring-juniper/10 transition-all">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-transparent text-sm text-ink font-body focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Seller Action: "Post New Listing" button */}
          {role === 'seller' && (
            <Button
              as={Link}
              to="/sell"
              variant="accent"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-md text-white font-display font-bold uppercase tracking-wider text-xs transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Post New Listing
            </Button>
          )}
        </div>

        {/* Categories Grid/List (Both roles see) */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {categories.map((cat) => (
              <span
                key={cat.id || cat.name || cat}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-ink/75 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                {cat.name || cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. User Info & Role Specific Navigation / Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-line rounded-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-juniper/10 text-juniper border border-juniper/25 flex items-center justify-center font-display font-extrabold text-sm uppercase">
            {role === 'seller' ? 'S' : 'B'}
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest font-mono">
              Logged in as {role}
            </p>
            <p className="text-sm font-display font-bold text-ink">{user.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Seller Action: "My Listings" link */}
          {role === 'seller' && (
            <Link
              to="/my-listings"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-display font-bold text-juniper hover:text-mustard transition-colors border border-juniper/30 rounded-xl bg-white shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              My Listings
            </Link>
          )}

          {/* Buyer Action: "Add to Favorites" button, "Contact Seller" button */}
          {role === 'buyer' && (
            <>
              <Button
                variant="outline"
                onClick={onAddToFavorites}
                className="flex items-center gap-1.5 rounded-xl border-slate-300 hover:bg-slate-100 bg-white"
              >
                <svg className="w-4 h-4 text-mustard" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Add to Favorites
              </Button>

              <Button
                variant="primary"
                onClick={onContactSeller}
                className="flex items-center gap-1.5 rounded-xl bg-juniper text-white hover:bg-juniper-dark"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                Contact Seller
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 3. Listings Section (Both roles see) */}
      <div className="space-y-4 pt-4">
        <h4 className="font-display font-extrabold text-lg text-ink">Listings Available</h4>
        <div className="w-full">
          {listings}
        </div>
      </div>
    </div>
  );
}