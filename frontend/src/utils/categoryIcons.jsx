import React from 'react';

// Single source of truth for how a category *looks* (icon + pastel
// color) across the app — the homepage's "Browse by Category" grid
// and the navbar's Categories dropdown both render from this list.
// `dbSlug` is matched against the real categories the backend
// returns (see api/listings.api.js -> categoriesApi.getAll) so a
// click always lands on a working /category/:slug page even if the
// backend's exact slug differs slightly from the guess here.
export const CATEGORY_VISUALS = [
  {
    name: 'Electronics',
    dbSlug: 'electronics',
    bg: 'bg-indigo-50',
    fg: 'text-indigo-600',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    ),
  },
  {
    name: 'Furniture & Home',
    dbSlug: 'furniture',
    bg: 'bg-amber-50',
    fg: 'text-amber-700',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h16v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13V9a2 2 0 012-2h10a2 2 0 012 2v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2M20 17v2" />
      </svg>
    ),
  },
  {
    name: 'Fashion',
    dbSlug: 'apparel',
    bg: 'bg-orange-50',
    fg: 'text-orange-600',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4l3 2 3-2 5 3-2 3-3-1.5V20H8V8.5L5 10 3 7l6-3z" />
      </svg>
    ),
  },
  {
    name: 'Vehicles',
    dbSlug: 'vehicles',
    bg: 'bg-emerald-50',
    fg: 'text-emerald-600',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3v-4l2-5h11l3 5v4h-2M9 8V5h4v3" />
      </svg>
    ),
  },
  {
    name: 'Books & Education',
    dbSlug: 'books',
    bg: 'bg-blue-50',
    fg: 'text-blue-600',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5v13m0-13C10.7 5.6 9 5 7 5S3.3 5.6 2 6.5v13C3.3 18.6 5 18 7 18s3.7.6 5 1.5m0-13C13.3 5.6 15 5 17 5c2 0 3.7.6 5 1.5v13c-1.3-.9-3-1.5-5-1.5s-3.7.6-5 1.5" />
      </svg>
    ),
  },
  {
    name: 'Tools & Equipment',
    dbSlug: 'tools',
    bg: 'bg-yellow-50',
    fg: 'text-yellow-700',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2-2 2.5-2.5z" />
      </svg>
    ),
  },
  {
    name: 'Hobbies',
    dbSlug: 'hobbies',
    bg: 'bg-rose-50',
    fg: 'text-rose-500',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="8" cy="17" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17V4l7 2v9" />
        <circle cx="18" cy="15" r="2.2" />
      </svg>
    ),
  },
  {
    name: 'Office & Business',
    dbSlug: 'office',
    bg: 'bg-stone-100',
    fg: 'text-stone-600',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 19v-6a6 6 0 1112 0v6M4 19h16M8 19v2M16 19v2" />
      </svg>
    ),
  },
  {
    name: 'Other',
    dbSlug: 'other',
    bg: 'bg-gray-100',
    fg: 'text-gray-500',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9-4 9 4-9 4-9-4zm0 0v8l9 4 9-4V8" />
      </svg>
    ),
  },
];

// Given the real categories from GET /api/categories, find the best
// visual match for a CATEGORY_VISUALS entry (by slug, then by loose
// name match) so a click always resolves to a real, working slug.
export function resolveCategorySlug(visualCat, apiCategories) {
  const found = apiCategories.find(
    (c) =>
      c.slug === visualCat.dbSlug ||
      c.name.toLowerCase().includes(visualCat.dbSlug.split('-')[0]) ||
      visualCat.name.toLowerCase().includes(c.name.toLowerCase())
  );
  return found ? found.slug : visualCat.dbSlug;
}
