import { useCallback, useEffect, useState } from 'react';
import { listingsApi } from '../api/listings.api.js';
import { useDebounce } from './useDebounce.js';

const DEFAULT_FILTERS = {
  q: '',
  category_id: '',
  condition: '',
  min_price: '',
  max_price: '',
  city: '',
  page: 1,
  limit: 20,
};

// Centralizes everything the Home/browse page needs: filter state,
// debounced keyword search, pagination, and the fetch itself — so the
// page component stays focused on layout, not data-fetching logic.
export function useListings() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedQuery = useDebounce(filters.q, 400);

  const fetchListings = useCallback((activeFilters) => {
    setLoading(true);
    setError('');
    listingsApi
      .search(activeFilters)
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch whenever the debounced query, page, or any non-text
  // filter changes. Text search is debounced; everything else (a
  // dropdown, a page click) applies immediately since it's not typed.
  useEffect(() => {
    fetchListings({ ...filters, q: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedQuery,
    filters.category_id,
    filters.condition,
    filters.min_price,
    filters.max_price,
    filters.city,
    filters.page,
  ]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: key === 'page' ? value : 1 }));
  }

  return { filters, updateFilter, items, total, loading, error };
}
