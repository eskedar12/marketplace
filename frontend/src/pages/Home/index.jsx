import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { listingsApi, categoriesApi } from '../../api/listings.api.js';
import ListingGrid from '../../components/listings/ListingGrid.jsx';
import { CATEGORY_VISUALS } from '../../utils/categoryIcons.jsx';
import { CITIES } from '../../utils/constants.js';
import { getHeroTheme } from '../../utils/heroThemes.js';

const PAGE_SIZE = 12;

// Small deterministic hash so the hero photo for a given category
// stays the same across re-renders instead of changing every load.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1760625345932-448b852afdf9?auto=format&fit=crop&w=1740&q=80';

const WHY_REGEBEYA = [
  {
    title: 'Safe Marketplace',
    body: 'Buy and sell with confidence.',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-500',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Local Listings',
    body: 'Find items near you.',
    bg: 'bg-orange-50',
    iconBg: 'bg-mustard',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.66 16.66L13.4 20.9a2 2 0 01-2.83 0l-4.24-4.24a8 8 0 1111.31 0z" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    ),
  },
  {
    title: 'Easy Communication',
    body: 'Connect directly with sellers.',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 01-8.5 8.5 8.6 8.6 0 01-3.6-.78L3 20l1.02-3.67A8.4 8.4 0 013 12.5 8.5 8.5 0 0111.5 4h.5a8.5 8.5 0 019 8v-.5z" />
      </svg>
    ),
  },
  {
    title: 'Trusted Sellers',
    body: 'Ratings help you buy safely.',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-400',
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17.1l-5.9 3.4 1.3-6.6-4.9-4.6 6.6-.7z" />
      </svg>
    ),
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    listingsApi
      .search({ limit: 5, page: 1 })
      .then((res) => setRecent(res.data.items))
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, []);

  // ---- Category browsing (real listings from the API, in-place —
  // no navigation away from Home) ---------------------------------
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const activeCategory = categorySlug
    ? CATEGORY_VISUALS.find((c) => c.dbSlug === categorySlug)
    : null;

  // categoryIds resolves the slug to every category_id whose listings
  // belong here (the category itself, plus subcategories if any exist).
  const [categoryIds, setCategoryIds] = useState(null);
  useEffect(() => {
    if (!activeCategory) {
      setCategoryIds(null);
      return;
    }
    categoriesApi
      .getBySlug(activeCategory.dbSlug)
      .then((res) => setCategoryIds(res.data.categoryIds))
      .catch(() => setCategoryIds([]));
  }, [activeCategory]);

  const [categoryItems, setCategoryItems] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    setCategoryItems([]);
    setCategoryPage(1);
    setCategoryTotal(0);
  }, [categorySlug]);

  useEffect(() => {
    if (!activeCategory || categoryIds === null) return;
    setCategoryLoading(true);
    listingsApi
      .search({ category_id: categoryIds.join(','), page: categoryPage, limit: PAGE_SIZE })
      .then((res) => {
        setCategoryItems((prev) => (categoryPage === 1 ? res.data.items : [...prev, ...res.data.items]));
        setCategoryTotal(res.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setCategoryLoading(false));
  }, [activeCategory, categoryIds, categoryPage]);

  const hasMoreCategoryItems = categoryItems.length < categoryTotal;

  // Infinite scroll: bump the page once the sentinel below the grid
  // scrolls into view.
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!activeCategory || !hasMoreCategoryItems || categoryLoading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCategoryPage((p) => p + 1);
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeCategory, hasMoreCategoryItems, categoryLoading]);

  // Bring the listings section into view when a category is chosen
  // from the navbar, so it's obvious something changed.
  const listingsSectionRef = useRef(null);
  useEffect(() => {
    if (activeCategory) {
      listingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [categorySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearCategory() {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    setSearchParams(next);
  }

  // ---- Hero theme (background photo, tint, headline) swaps per
  // category so each category "feels" like its own page. ----------
  const heroTheme = getHeroTheme(activeCategory?.dbSlug);
  const heroImageUrl = activeCategory
    ? `https://loremflickr.com/1600/900/${heroTheme.keyword}?lock=${hashString(activeCategory.dbSlug)}`
    : DEFAULT_HERO_IMAGE;

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    navigate(`/listings?${params.toString()}`);
  }

  return (
    <div className="w-full">
      {/* 1. Hero — background, tint, and headline swap per category */}
      <section className="relative overflow-hidden">
        <div
          key={heroImageUrl}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url('${heroImageUrl}')` }}
        />
        {/* Light, uniform dark wash — just enough for text contrast,
            without hiding the actual category photo underneath. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/45 to-ink/30" />

        <div className="relative max-w-4xl mx-auto z-10 px-4 py-20 md:py-28 text-center">
          {activeCategory && (
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-body font-semibold px-3 py-1.5 rounded-full mb-5 backdrop-blur border border-white/20">
              <span className="w-4 h-4">{activeCategory.icon('w-4 h-4')}</span>
              Browsing {activeCategory.name}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 font-display drop-shadow-lg">
            {heroTheme.headlineLead} <span className="text-mustard">{heroTheme.headlineHighlight}</span>{' '}
            {heroTheme.headlineTail}
          </h1>

          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch gap-2 mt-10"
          >
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-0 border-b md:border-b-0 md:border-r border-line">
              <svg className="w-[18px] h-[18px] text-ink/30 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-ink font-body focus:outline-none placeholder-ink/40"
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 md:py-0 flex-shrink-0">
              <svg className="w-[18px] h-[18px] text-ink/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.66 16.66L13.4 20.9a2 2 0 01-2.83 0l-4.24-4.24a8 8 0 1111.31 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent text-sm font-medium text-ink font-body focus:outline-none cursor-pointer pr-2"
              >
                <option value="">All Ethiopia</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-mustard hover:bg-mustard-dark text-white font-display font-bold text-sm px-8 py-3 rounded-xl md:rounded-full transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. Browse by Category */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-display font-extrabold text-2xl text-ink mb-8 text-center">Browse by Category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {CATEGORY_VISUALS.map((cat) => {
            const keyword = cat.dbSlug === 'books' ? 'books,bookstack' : getHeroTheme(cat.dbSlug).keyword;
            return (
              <Link
                key={cat.name}
                to={`/?category=${cat.dbSlug}`}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all ${
                  categorySlug === cat.dbSlug ? 'border-mustard ring-1 ring-mustard' : 'border-line'
                }`}
              >
                <div className={`w-full aspect-square ${cat.bg}`}>
                  <img
                    src={`https://loremflickr.com/400/400/${keyword}?lock=${hashString(cat.dbSlug)}`}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-body font-medium text-base text-ink leading-tight text-center py-4 px-2">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Recently Listed / category browse (in-place, no page navigation) */}
      <section ref={listingsSectionRef} id="listings" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h2 className="font-display font-extrabold text-2xl text-ink">
            {activeCategory ? activeCategory.name : 'Recently Listed'}
          </h2>

          {activeCategory ? (
            <button
              onClick={clearCategory}
              className="flex items-center gap-1 text-sm font-body font-semibold text-ink/50 hover:text-mustard transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </button>
          ) : (
            <Link to="/listings" className="text-sm font-body font-semibold text-mustard hover:text-mustard-dark transition-colors">
              View All &rarr;
            </Link>
          )}
        </div>

        <ListingGrid
          listings={activeCategory ? categoryItems : recent}
          loading={activeCategory ? false : recentLoading}
          emptyTitle={activeCategory ? `No listings in ${activeCategory.name} yet` : undefined}
        />

        {activeCategory && (
          <>
            <div ref={sentinelRef} className="h-1" />
            <p className="text-center text-xs text-ink/40 font-body py-8">
              {hasMoreCategoryItems
                ? `Loading more ${activeCategory.name.toLowerCase()}…`
                : `You've reached the end — that's all the ${activeCategory.name.toLowerCase()} for now.`}
            </p>
          </>
        )}
      </section>

      {/* 4. Why ReGebeya */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display font-extrabold text-2xl text-ink text-center mb-8">Why ReGebeya?</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WHY_REGEBEYA.map((item) => (
            <div key={item.title} className={`rounded-2xl p-6 text-center ${item.bg}`}>
              <span className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${item.iconBg}`}>
                {item.icon}
              </span>
              <h3 className="font-display font-bold text-sm text-ink mb-1">{item.title}</h3>
              <p className="text-xs font-body text-ink/60">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center h-32 sm:h-40">
          {/* Photo — a real box of items, filling the left edge of the banner.
              Fixed Unsplash photo (not a keyword-matched service) so the
              same, on-theme image shows every time instead of whatever a
              loose keyword search happens to return. */}
          <img
            src="https://images.unsplash.com/photo-1647489238347-dbd651c2f37a?auto=format&fit=crop&w=600&h=250&q=80"
            alt="A box of items ready to be given a new home"
            className="w-32 sm:w-56 md:w-72 h-full object-cover object-center flex-shrink-0"
          />

          <div className="flex-1 flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-8 h-full relative z-10">
            <div>
              <p className="font-display font-extrabold text-base sm:text-2xl text-ink leading-snug">
                Have something you don't need anymore?
              </p>
              <p className="font-display font-extrabold text-base sm:text-2xl text-mustard leading-snug">
                Give it a new home.
              </p>
            </div>

            <Link
              to="/sell"
              className="hidden sm:flex items-center gap-1.5 bg-mustard hover:bg-mustard-dark text-white font-display font-bold text-sm px-7 py-3.5 rounded-full transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Sell an Item
            </Link>
          </div>

          {/* Decorative diamond pattern spanning the right side, echoing traditional Ethiopian textile motifs */}
          <svg
            className="hidden sm:block absolute right-0 top-0 h-full w-56 text-orange-900/10 pointer-events-none"
            viewBox="0 0 220 160"
            preserveAspectRatio="xMaxYMid slice"
            fill="none"
          >
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 7 }).map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  x={col * 32 - 16}
                  y={row * 32 - 16}
                  width="22"
                  height="22"
                  transform={`rotate(45 ${col * 32 - 5} ${row * 32 - 5})`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              ))
            )}
          </svg>
        </div>

        {/* Mobile-only Sell button below the banner, since the pill button
            is hidden on small screens to keep the banner compact */}
        <Link
          to="/sell"
          className="sm:hidden mt-4 flex items-center justify-center gap-1.5 bg-mustard hover:bg-mustard-dark text-white font-display font-bold text-sm px-7 py-3.5 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Sell an Item
        </Link>
      </section>
    </div>
  );
}
