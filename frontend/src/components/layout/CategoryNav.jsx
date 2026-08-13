import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../../api/listings.api.js';

const CLOSE_DELAY = 150;

/**
 * CategoryNav
 * Horizontal category bar with hover/tap dropdowns, styled after
 * Carousell's nav. Categories + subcategories come straight from
 * GET /api/categories (already returned as a 2-level tree by the
 * backend), so this stays in sync with whatever is in the `categories`
 * table — no hardcoded list to maintain.
 */
export default function CategoryNav() {
  const [categories, setCategories] = useState([]);
  const [openSlug, setOpenSlug] = useState(null);
  const closeTimer = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Close the open dropdown on any click/tap outside the nav — needed
  // for touch devices, which don't fire mouseleave.
  useEffect(() => {
    function handleOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenSlug(null);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function openNow(slug) {
    clearTimeout(closeTimer.current);
    setOpenSlug(slug);
  }

  // Small delay before closing so moving the mouse from the trigger
  // down into the dropdown panel doesn't cause it to flicker shut.
  function closeSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenSlug(null), CLOSE_DELAY);
  }

  function toggle(slug) {
    setOpenSlug((current) => (current === slug ? null : slug));
  }

  if (!categories.length) return null;

  return (
    <nav ref={navRef} className="bg-ink relative z-10" onMouseLeave={closeSoon}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ul className="flex items-stretch gap-0.5 overflow-x-auto">
          {categories.map((cat) => {
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isOpen = openSlug === cat.slug;

            return (
              <li
                key={cat.id}
                className="relative flex-shrink-0"
                onMouseEnter={() => hasSubs && openNow(cat.slug)}
              >
                <Link
                  to={`/?category=${cat.slug}`}
                  onClick={(e) => {
                    if (hasSubs) {
                      // First tap/click opens the dropdown (mirrors
                      // Carousell); the link only navigates once it's
                      // already open, or immediately for leaf categories.
                      if (!isOpen) {
                        e.preventDefault();
                        toggle(cat.slug);
                        return;
                      }
                    }
                    setOpenSlug(null);
                  }}
                  className={`flex items-center px-3.5 py-3 text-sm font-body font-semibold whitespace-nowrap transition-colors ${
                    isOpen ? 'text-white bg-white/10' : 'text-white/85 hover:text-mustard'
                  }`}
                >
                  {cat.name}
                </Link>

                {hasSubs && isOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full min-w-[240px] bg-ink shadow-2xl py-2"
                    onMouseEnter={() => openNow(cat.slug)}
                  >
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/?category=${sub.slug}`}
                        role="menuitem"
                        onClick={() => setOpenSlug(null)}
                        className="block px-5 py-3 text-sm font-body text-white/80 hover:text-mustard transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}