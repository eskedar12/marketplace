import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { listingsApi, categoriesApi } from '../../api/listings.api.js';
import ListingGrid from '../../components/listings/ListingGrid.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { CATEGORY_VISUALS, getCategoryDisplayName } from '../../utils/categoryIcons.jsx';
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
    titleKey: 'safeMarketplaceTitle',
    bodyKey: 'safeMarketplaceBody',
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
    titleKey: 'localListingsTitle',
    bodyKey: 'localListingsBody',
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
    titleKey: 'easyCommTitle',
    bodyKey: 'easyCommBody',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 01-8.5 8.5 8.6 8.6 0 01-3.6-.78L3 20l1.02-3.67A8.4 8.4 0 013 12.5 8.5 8.5 0 0111.5 4h.5a8.5 8.5 0 019 8v-.5z" />
      </svg>
    ),
  },
  {
    titleKey: 'trustedSellersTitle',
    bodyKey: 'trustedSellersBody',
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
  const location = useLocation();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [redirectMessage, setRedirectMessage] = useState(location.state?.message || null);

  // Clear the message from history state so it doesn't reappear on
  // back/forward navigation or a refresh.
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

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
  const subSlug = searchParams.get('sub');
  const activeCategory = categorySlug
    ? CATEGORY_VISUALS.find((c) => c.dbSlug === categorySlug)
    : null;

  // categoryDetail comes from GET /api/categories/:slug — the category
  // itself plus its subcategories (for the pill row) and categoryIds
  // (every id whose listings belong under this category).
  const [categoryDetail, setCategoryDetail] = useState(null);
  useEffect(() => {
    if (!activeCategory) {
      setCategoryDetail(null);
      return;
    }
    categoriesApi
      .getBySlug(activeCategory.dbSlug)
      .then((res) => setCategoryDetail(res.data))
      .catch(() => setCategoryDetail({ subcategories: [], categoryIds: [] }));
  }, [activeCategory]);

  // When a subcategory pill is picked, narrow down to just that
  // subcategory's id; otherwise browse every id under the category.
  const activeSubcategory = subSlug
    ? categoryDetail?.subcategories.find((s) => s.slug === subSlug) || null
    : null;
  const categoryIds = activeSubcategory
    ? [activeSubcategory.id]
    : categoryDetail?.categoryIds ?? null;

  function selectSubcategory(slug) {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('sub', slug);
    } else {
      next.delete('sub');
    }
    setSearchParams(next);
  }

  const [categoryItems, setCategoryItems] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    setCategoryItems([]);
    setCategoryPage(1);
    setCategoryTotal(0);
  }, [categorySlug, subSlug]);

  const categoryIdsKey = categoryIds ? categoryIds.join(',') : null;

  useEffect(() => {
    if (!activeCategory || categoryIdsKey === null) return;
    setCategoryLoading(true);
    listingsApi
      .search({ category_id: categoryIdsKey, page: categoryPage, limit: PAGE_SIZE })
      .then((res) => {
        setCategoryItems((prev) => (categoryPage === 1 ? res.data.items : [...prev, ...res.data.items]));
        setCategoryTotal(res.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setCategoryLoading(false));
  }, [activeCategory, categoryIdsKey, categoryPage]);

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

  // Smooth-scrolled to on click from the "Browse by Category" grid
  // below (see its onClick handlers) so picking a category there jumps
  // straight to the results. The top navbar's category links deliberately
  // don't trigger this — they only swap the hero theme in place.
  const listingsSectionRef = useRef(null);

  function clearCategory() {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('sub');
    setSearchParams(next);
  }

  // ---- Hero theme (background photo, tint, headline) swaps per
  // category so each category "feels" like its own page. ----------
  const heroTheme = getHeroTheme(activeCategory?.dbSlug);
  const activeCategoryName = activeCategory ? t(`navbar.${activeCategory.i18nKey}`) : '';
  const heroImageUrl =
    heroTheme.image ||
    (activeCategory
      ? `https://loremflickr.com/1600/900/${heroTheme.keyword}?lock=${hashString(activeCategory.dbSlug)}`
      : DEFAULT_HERO_IMAGE);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    navigate(`/listings?${params.toString()}`);
  }

  return (
    <div className="w-full">
      {redirectMessage && (
        <div className="bg-mustard/10 border-b border-mustard/30 text-ink text-sm font-body px-4 py-3 flex items-center justify-center gap-3">
          <span>{redirectMessage}</span>
          <button
            onClick={() => setRedirectMessage(null)}
            className="text-ink/50 hover:text-ink font-bold"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      {/* 1. Hero — background, tint, and headline swap per category */}
      <section className="relative overflow-hidden min-h-[520px] md:min-h-[640px]">
        <div
          key={heroImageUrl}
          className="absolute inset-0 transition-opacity duration-500 bg-slate-900"
          style={{
            backgroundImage: `url('${heroImageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Light, uniform dark wash — just enough for text contrast,
            without hiding the actual category photo underneath. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/30" />

        <div className="relative z-10 px-4 sm:px-8 md:px-16 py-20 md:py-28 min-h-[520px] md:min-h-[640px] flex flex-col justify-center max-w-3xl text-left">
          {activeCategory && (
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-body font-semibold px-3 py-1.5 rounded-full mb-5 backdrop-blur border border-white/20 self-start">
              <span className="w-4 h-4">{activeCategory.icon('w-4 h-4')}</span>
              {t('home.browsing', { name: activeCategoryName })}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 font-display drop-shadow-lg">
            {t('home.heroLine1')} <span className="text-mustard">{t('home.heroHighlight')}</span>
            <br />
            {t('home.heroLine2')}
          </h1>

          <p className="text-white/70 text-sm sm:text-base font-body mb-8">
            {t('home.heroSubtitle')}
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch gap-2"
          >
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-0 border-b md:border-b-0 md:border-r border-white/15">
              <svg className="w-[18px] h-[18px] text-white/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white font-body focus:outline-none placeholder-white/40"
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 md:py-0 flex-shrink-0">
              <svg className="w-[18px] h-[18px] text-white/50 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.66 16.66L13.4 20.9a2 2 0 01-2.83 0l-4.24-4.24a8 8 0 1111.31 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent text-sm font-medium text-white font-body focus:outline-none cursor-pointer pr-2 [&>option]:text-ink"
              >
                <option value="">{t('home.allEthiopia')}</option>
                {CITIES.map((c) => (
                  <option key={c.value} value={c.value}>{t(`cities.${c.key}`)}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-mustard hover:bg-mustard-dark text-white font-display font-bold text-sm px-8 py-3 rounded-xl md:rounded-full transition-colors"
            >
              {t('home.search')}
            </button>
          </form>
        </div>
      </section>

      {/* 2. Browse by Category */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-display font-extrabold text-2xl text-ink mb-8 text-center">{t('home.browseByCategory')}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {CATEGORY_VISUALS.map((cat) => (
            <Link
              key={cat.name}
              to={`/?category=${cat.dbSlug}`}
              onClick={() =>
                listingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className={`flex flex-col overflow-hidden rounded-2xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all ${
                categorySlug === cat.dbSlug ? 'border-mustard ring-1 ring-mustard' : 'border-line'
              }`}
            >
              <div className={`w-full h-36 sm:h-40 ${cat.bg}`}>
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {cat.icon(`w-10 h-10 ${cat.fg}`)}
                  </div>
                )}
              </div>
              <span className="font-body font-medium text-base text-ink leading-tight text-center py-4 px-2">
                {t(`navbar.${cat.i18nKey}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Recently Listed / category browse (in-place, no page navigation) */}
      <section ref={listingsSectionRef} id="listings" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h2 className="font-display font-extrabold text-2xl text-ink">
            {activeCategory ? activeCategoryName : t('home.recentlyListed')}
          </h2>

          {activeCategory ? (
            <button
              onClick={clearCategory}
              className="flex items-center gap-1 text-sm font-body font-semibold text-ink/50 hover:text-mustard transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('home.clearFilter')}
            </button>
          ) : (
            <Link to="/listings" className="text-sm font-body font-semibold text-mustard hover:text-mustard-dark transition-colors">
              {t('home.viewAll')}
            </Link>
          )}
        </div>

        {activeCategory && categoryDetail?.subcategories?.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mt-2">
            <button
              onClick={() => selectSubcategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-semibold whitespace-nowrap border transition-colors ${
                !activeSubcategory
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-ink/70 border-line hover:border-ink/40'
              }`}
            >
              All
            </button>
            {categoryDetail.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => selectSubcategory(sub.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-semibold whitespace-nowrap border transition-colors ${
                  activeSubcategory?.slug === sub.slug
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink/70 border-line hover:border-ink/40'
                }`}
              >
                {getCategoryDisplayName(sub, t)}
              </button>
            ))}
          </div>
        )}

        <ListingGrid
          listings={activeCategory ? categoryItems : recent}
          loading={activeCategory ? false : recentLoading}
          emptyTitle={activeCategory ? t('home.noListingsInCategory', { name: activeCategoryName }) : undefined}
        />

        {activeCategory && (
          <>
            <div ref={sentinelRef} className="h-1" />
            <p className="text-center text-xs text-ink/40 font-body py-8">
              {hasMoreCategoryItems
                ? t('home.loadingMore', { name: activeCategoryName.toLowerCase() })
                : t('home.reachedEnd', { name: activeCategoryName.toLowerCase() })}
            </p>
          </>
        )}
      </section>

      {/* 4. Why ReGebeya */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display font-extrabold text-2xl text-ink text-center mb-8">{t('home.whyRegebeya')}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WHY_REGEBEYA.map((item) => (
            <div key={item.titleKey} className={`rounded-2xl p-6 text-center ${item.bg}`}>
              <span className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${item.iconBg}`}>
                {item.icon}
              </span>
              <h3 className="font-display font-bold text-sm text-ink mb-1">{t(`home.${item.titleKey}`)}</h3>
              <p className="text-xs font-body text-ink/60">{t(`home.${item.bodyKey}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF7ED] to-[#FFFBEB] border border-[#FFEDD5] flex items-center h-32 sm:h-40">
          {/* Photo — a real box of items, filling the left edge of the banner.
              Served from /public so it loads instantly and never depends
              on an external image host. */}
          <img
            src="/basket.jpg"
            alt="A box of items ready to be given a new home"
            className="w-32 sm:w-56 md:w-72 h-full object-cover object-center flex-shrink-0"
          />

          <div className="flex-1 flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-8 h-full relative z-10">
            <div>
              <p className="font-display font-extrabold text-base sm:text-2xl text-[#0F172A] leading-snug">
                {t('home.ctaLine1')}
              </p>
              <p className="font-display font-extrabold text-base sm:text-2xl text-mustard leading-snug">
                {t('home.ctaLine2')}
              </p>
            </div>

            <Link
              to="/sell"
              className="hidden sm:flex items-center gap-1.5 bg-mustard hover:bg-mustard-dark text-white font-display font-bold text-sm px-7 py-3.5 rounded-full transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('home.sellAnItem')}
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
          {t('home.sellAnItem')}
        </Link>
      </section>
    </div>
  );
}