import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListings } from '../../hooks/useListings.js';
import { categoriesApi } from '../../api/listings.api.js';
import Sidebar from '../../components/layout/Sidebar.jsx';
import FilterBar from '../../components/listings/FilterBar.jsx';
import ListingGrid from '../../components/listings/ListingGrid.jsx';
import Button from '../../components/common/Button.jsx';

const VISUAL_CATEGORIES = [
  {
    name: 'Electronics',
    subtext: 'Phones, Laptops, TVs, Gaming',
    dbSlug: 'electronics',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    bgColor: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100/50',
  },
  {
    name: 'Furniture & Home',
    subtext: 'Sofas, Beds, Tables, Decor',
    dbSlug: 'furniture',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-9V4a1 1 0 00-1-1H4a1 1 0 00-1 1v3H2a1 1 0 00-1 1v2a2 2 0 002 2h18a2 2 0 002-2V8a1 1 0 00-1-1zM4 12v7a1 1 0 001 1h3a1 1 0 001-1v-7M20 12v7a1 1 0 001 1h-3a1 1 0 00-1-1v-7" />
      </svg>
    ),
    bgColor: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/50',
  },
  {
    name: 'Fashion',
    subtext: 'Men, Women, Shoes, Bags',
    dbSlug: 'apparel',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1.35-1.9l-5.83-1.95a2 2 0 00-1.64 0L6.35 6.1A2 2 0 005 8v8a2 2 0 001.35 1.9l5.83 1.95a2 2 0 001.64 0l5.83-1.95A2 2 0 0021 16z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4M12 12l-6 2M12 12l6 2M12 12v8" />
      </svg>
    ),
    bgColor: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100/50',
  },
  {
    name: 'Vehicles',
    subtext: 'Cars, Bikes, Spare Parts',
    dbSlug: 'vehicles',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17h14v-6H5v6zm0 0v-2M9 7h6l2 4H7l2-4z" />
      </svg>
    ),
    bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50',
  },
  {
    name: 'Home Appliances',
    subtext: 'Fridges, Washers, Cookers',
    dbSlug: 'household-appliances',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="5" y1="12" x2="19" y2="12" />
        <circle cx="12" cy="7" r="1" />
        <circle cx="12" cy="17" r="3" />
      </svg>
    ),
    bgColor: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50',
  },
  {
    name: 'Books & Education',
    subtext: 'Textbooks, Novels, Supplies',
    dbSlug: 'books',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" />
      </svg>
    ),
    bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100/50',
  },
  {
    name: 'Tools & Equipment',
    subtext: 'Power Tools, Construction',
    dbSlug: 'tools',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 7.003a2 2 0 102.83 2.83M9 11l-5.733 5.733a2 2 0 002.828 2.829L11.9 13.7M15 9l6-6M17 7l4 4" />
      </svg>
    ),
    bgColor: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100/50',
  },
  {
    name: 'Hobbies',
    subtext: 'Gaming, Music, Sports, Toys',
    dbSlug: 'hobbies',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100/50',
  },
  {
    name: 'Office & Business',
    subtext: 'Printers, Computers, Desks',
    dbSlug: 'office',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100/50',
  },
  {
    name: 'Other',
    subtext: 'Anything else you need',
    dbSlug: 'other',
    icon: (className) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    bgColor: 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100/50',
  },
];

export default function Home() {
  const { filters, updateFilter, items, total, loading, error } = useListings();
  const [apiCategories, setApiCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(filters.q || '');
  const [searchCity, setSearchCity] = useState(filters.city || '');
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Sync inputs with filters in case filters change from filters panel or tags
  useEffect(() => {
    setSearchQuery(filters.q || '');
  }, [filters.q]);

  useEffect(() => {
    setSearchCity(filters.city || '');
  }, [filters.city]);

  // Load API Categories to map visual clicks to category UUIDs
  useEffect(() => {
    categoriesApi
      .getAll()
      .then((res) => setApiCategories(res.data))
      .catch(() => {});
  }, []);

  // CategoryNav (the dropdown bar) links to /?category=<slug> instead of
  // touching filter state directly, since it's rendered outside Home.
  // Once the real categories are loaded, resolve that slug — which may
  // belong to a parent OR a subcategory — to a category_id and clear it
  // from the URL so it doesn't stick around after the user changes filters.
  useEffect(() => {
    const slug = searchParams.get('category');
    if (!slug || apiCategories.length === 0) return;

    const flatCategories = apiCategories.flatMap((c) => [c, ...(c.subcategories || [])]);
    const match = flatCategories.find((c) => c.slug === slug);

    if (match) {
      updateFilter('category_id', match.id);
      updateFilter('q', '');
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCategories, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('q', searchQuery);
    updateFilter('city', searchCity);
  };

  const handleCategoryClick = (visualCat) => {
    // Attempt to map visual category to DB category slug or sub-name
    const found = apiCategories.find(
      (c) =>
        c.slug === visualCat.dbSlug ||
        c.name.toLowerCase().includes(visualCat.dbSlug) ||
        visualCat.name.toLowerCase().includes(c.name.toLowerCase())
    );

    if (found) {
      // If we are clicking a category that is already selected, clear it
      if (filters.category_id === found.id) {
        updateFilter('category_id', '');
      } else {
        updateFilter('category_id', found.id);
        updateFilter('q', ''); // Clear general search query for precise category
      }
    } else {
      // Fallback: If category not in DB yet, query it as text search
      if (filters.q.toLowerCase() === visualCat.name.toLowerCase()) {
        updateFilter('q', '');
      } else {
        updateFilter('category_id', '');
        updateFilter('q', visualCat.name === 'Other' ? '' : visualCat.name);
      }
    }
  };

  const isCatActive = (visualCat) => {
    if (filters.category_id) {
      const foundDbCat = apiCategories.find((c) => c.id === filters.category_id);
      if (foundDbCat) {
        return (
          foundDbCat.slug === visualCat.dbSlug ||
          foundDbCat.name.toLowerCase().includes(visualCat.dbSlug) ||
          visualCat.name.toLowerCase().includes(foundDbCat.name.toLowerCase())
        );
      }
    }
    if (filters.q && visualCat.name !== 'Other') {
      return filters.q.toLowerCase() === visualCat.name.toLowerCase();
    }
    return false;
  };

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-juniper via-juniper-dark to-slate-900 py-16 md:py-24 text-center px-4">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative max-w-4xl mx-auto z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-mustard/20 text-mustard border border-mustard/30 mb-4 animate-pulse">
            🇪🇹 Marketplace for Ethiopia
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 font-display">
            Every kinda thing,<br className="sm:hidden" />{' '}
            <span className="bg-gradient-to-r from-mustard via-orange-400 to-amber-300 bg-clip-text text-transparent">
              for every kinda person
            </span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-8 font-body font-light">
            ReGebeya is Ethiopia's cleanest local marketplace. Buy & sell phones, laptops, cars, furniture, and more with trusted locals.
          </p>

          {/* Centered Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch gap-2 border border-white/10"
          >
            {/* Location Select */}
            <div className="flex items-center gap-2 px-4 py-2.5 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 flex-shrink-0">
              <svg className="w-5 h-5 text-mustard flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  updateFilter('city', e.target.value);
                }}
                className="w-full bg-transparent text-sm font-semibold text-slate-700 font-body focus:outline-none cursor-pointer pr-4"
              >
                <option value="">All of Ethiopia</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Adama">Adama</option>
                <option value="Hawassa">Hawassa</option>
                <option value="Bahir Dar">Bahir Dar</option>
                <option value="Dire Dawa">Dire Dawa</option>
                <option value="Mekelle">Mekelle</option>
                <option value="Gondar">Gondar</option>
                <option value="Dessie">Dessie</option>
                <option value="Jimma">Jimma</option>
              </select>
            </div>

            {/* Keyword Input */}
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-0">
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 font-body focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-mustard hover:bg-mustard-dark text-white font-display font-bold text-sm px-8 py-3.5 rounded-xl md:rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Search
            </button>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-sm text-white/90">
            <span className="font-body text-slate-400 text-xs">Trending tags:</span>
            {['iPhone', 'PS5', 'Laptop', 'Sofa', 'Car'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  updateFilter('q', tag);
                }}
                className="px-3.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white rounded-full font-body text-xs transition-all duration-150 active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Categories Grid Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink">Browse by Category</h2>
          <p className="text-sm font-body text-ink/50 mt-1">Select a category to filter listings instantly</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {VISUAL_CATEGORIES.map((cat) => {
            const active = isCatActive(cat);
            return (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat)}
                className={`border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 group hover:shadow-md ${
                  active
                    ? 'border-mustard ring-2 ring-mustard/20 bg-mustard/[0.02] shadow-sm'
                    : 'border-line bg-white hover:border-mustard/40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-3 transition-transform duration-300 group-hover:scale-110 ${
                    active ? 'bg-mustard text-white border-mustard' : cat.bgColor
                  }`}
                >
                  {cat.icon('w-6 h-6')}
                </div>
                <span className="font-display font-bold text-sm text-ink group-hover:text-mustard transition-colors leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-ink/40 font-body mt-1 leading-tight line-clamp-1">
                  {cat.subtext}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <hr className="border-line max-w-6xl mx-auto px-4 sm:px-6 my-4" />

      {/* 3. Listings Explorer Feed */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-ink">Explore Listings</h2>
            <p className="text-xs font-body text-ink/50 mt-0.5">Showing {total} active offers in Ethiopia</p>
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {(filters.category_id || filters.q || filters.city || filters.condition || filters.min_price || filters.max_price) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white border border-line rounded-xl">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest font-display mr-1">Active filters:</span>
            {filters.q && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                Query: "{filters.q}"
                <button onClick={() => updateFilter('q', '')} className="text-slate-400 hover:text-slate-600 font-bold leading-none">&times;</button>
              </span>
            )}
            {filters.category_id && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                Category: {apiCategories.find((c) => c.id === filters.category_id)?.name || 'Selected'}
                <button onClick={() => updateFilter('category_id', '')} className="text-slate-400 hover:text-slate-600 font-bold leading-none">&times;</button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                City: {filters.city}
                <button onClick={() => updateFilter('city', '')} className="text-slate-400 hover:text-slate-600 font-bold leading-none">&times;</button>
              </span>
            )}
            {filters.condition && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                Condition: {filters.condition.replace('_', ' ')}
                <button onClick={() => updateFilter('condition', '')} className="text-slate-400 hover:text-slate-600 font-bold leading-none">&times;</button>
              </span>
            )}
            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                Price: {filters.min_price || '0'} - {filters.max_price || 'Max'} ETB
                <button
                  onClick={() => {
                    updateFilter('min_price', '');
                    updateFilter('max_price', '');
                  }}
                  className="text-slate-400 hover:text-slate-600 font-bold leading-none"
                >
                  &times;
                </button>
              </span>
            )}
            <button
              onClick={() => {
                updateFilter('q', '');
                updateFilter('category_id', '');
                updateFilter('city', '');
                updateFilter('condition', '');
                updateFilter('min_price', '');
                updateFilter('max_price', '');
              }}
              className="text-xs font-bold text-must hover:text-mustard-dark text-mustard ml-auto transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filtering */}
          <Sidebar title="Filters" className="w-full lg:w-64 flex-shrink-0">
            <FilterBar filters={filters} onChange={updateFilter} />
          </Sidebar>

          {/* Grid of listings */}
          <div className="flex-1">
            {error && <p className="text-clay text-sm mb-4 font-body">{error}</p>}

            <ListingGrid listings={items} loading={loading} />

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12 font-body text-sm">
                <Button
                  variant="outline"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilter('page', filters.page - 1)}
                  className="rounded-lg hover:bg-slate-50 border-slate-200"
                >
                  Prev
                </Button>
                <span className="text-ink/60 font-medium">
                  Page {filters.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={filters.page >= totalPages}
                  onClick={() => updateFilter('page', filters.page + 1)}
                  className="rounded-lg hover:bg-slate-50 border-slate-200"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}