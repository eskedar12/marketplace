import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../../api/listings.api.js';
import { CONDITIONS } from '../../utils/formatters.js';
import { Input, Select } from '../common/Input.jsx';

export default function FilterBar({ filters, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search items…"
        value={filters.q}
        onChange={(e) => onChange('q', e.target.value)}
      />
      <Select
        placeholder="All categories"
        value={filters.category_id}
        onChange={(e) => onChange('category_id', e.target.value)}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <Select
        placeholder="Any condition"
        value={filters.condition}
        onChange={(e) => onChange('condition', e.target.value)}
        options={CONDITIONS}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          min="0"
          placeholder="Min ETB"
          value={filters.min_price}
          onChange={(e) => onChange('min_price', e.target.value)}
          className="font-mono"
        />
        <Input
          type="number"
          min="0"
          placeholder="Max ETB"
          value={filters.max_price}
          onChange={(e) => onChange('max_price', e.target.value)}
          className="font-mono"
        />
      </div>
      <Input
        placeholder="City"
        value={filters.city}
        onChange={(e) => onChange('city', e.target.value)}
      />
    </div>
  );
}
