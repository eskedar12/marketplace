import React, { useEffect, useState, useCallback } from 'react';
import { listingsApi, categoriesApi } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import { CONDITIONS } from '../utils/format.js';

const EMPTY_FILTERS = {
  q: '',
  category_id: '',
  min_price: '',
  max_price: '',
  city: '',
  condition: '',
  page: 1,
  limit: 20,
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const runSearch = useCallback((activeFilters) => {
    setLoading(true);
    setError('');
    listingsApi
      .search(activeFilters)
      .then((res) => setResult({ items: res.data.items, total: res.data.total }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  function handleSubmit(e) {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    runSearch({ ...filters, page: 1 });
  }

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const totalPages = Math.max(1, Math.ceil(result.total / filters.limit));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-700 tracking-tight">
          Buy and sell, right in your neighborhood
        </h1>
        <p className="text-ink/60 mt-2 font-body">
          Every listing here is tagged with real condition, real price, no scrolling through chat groups.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-line p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
      >
        <input
          type="text"
          placeholder="Search items…"
          value={filters.q}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="lg:col-span-2 border border-line px-3 py-2 text-sm font-body focus:outline-none focus:border-juniper"
        />
        <select
          value={filters.category_id}
          onChange={(e) => updateFilter('category_id', e.target.value)}
          className="border border-line px-3 py-2 text-sm font-body focus:outline-none focus:border-juniper"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filters.condition}
          onChange={(e) => updateFilter('condition', e.target.value)}
          className="border border-line px-3 py-2 text-sm font-body focus:outline-none focus:border-juniper"
        >
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          placeholder="Min price"
          value={filters.min_price}
          onChange={(e) => updateFilter('min_price', e.target.value)}
          className="border border-line px-3 py-2 text-sm font-mono focus:outline-none focus:border-juniper"
        />
        <input
          type="number"
          min="0"
          placeholder="Max price"
          value={filters.max_price}
          onChange={(e) => updateFilter('max_price', e.target.value)}
          className="border border-line px-3 py-2 text-sm font-mono focus:outline-none focus:border-juniper"
        />
        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="border border-line px-3 py-2 text-sm font-body focus:outline-none focus:border-juniper"
        />
        <button
          type="submit"
          className="lg:col-span-1 bg-juniper text-paper font-display font-600 text-sm px-4 py-2 hover:bg-juniper-dark transition-colors"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="text-clay text-sm mb-4 font-body">{error}</p>
      )}

      {loading ? (
        <p className="text-ink/50 font-body text-sm">Loading listings…</p>
      ) : result.items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line">
          <p className="font-display font-600 text-lg">No listings match yet</p>
          <p className="text-ink/50 text-sm mt-1 font-body">Try widening your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {result.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 font-body text-sm">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="px-3 py-1.5 border border-line disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-ink/60">
                Page {filters.page} of {totalPages}
              </span>
              <button
                disabled={filters.page >= totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="px-3 py-1.5 border border-line disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
