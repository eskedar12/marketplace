import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../../api/listings.api.js';
import { CONDITIONS } from '../../utils/formatters.js';
import { CITIES, PRICE_RANGES } from '../../utils/constants.js';
import { Input, Select } from '../common/Input.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { CATEGORY_VISUALS } from '../../utils/categoryIcons.jsx';

// Categories come back from the API with their raw (English) `name`.
// Every other category list in the app (homepage grid, navbar, create-
// listing form) shows a translated label by matching the API category
// to a CATEGORY_VISUALS entry and using its i18nKey — mirror that here
// instead of rendering parent.name straight from the API, with the raw
// name kept as a fallback for any category the backend adds that isn't
// in CATEGORY_VISUALS yet.
function categoryLabel(apiCat, t) {
  const visual = CATEGORY_VISUALS.find(
    (v) =>
      v.dbSlug === apiCat.slug ||
      apiCat.name.toLowerCase().includes(v.dbSlug.split('-')[0]) ||
      v.name.toLowerCase() === apiCat.name.toLowerCase()
  );
  return visual ? t(`navbar.${visual.i18nKey}`) : apiCat.name;
}

export default function FilterBar({ filters, onChange }) {
  const { t } = useLanguage();
  const [categoryTree, setCategoryTree] = useState([]);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((res) => setCategoryTree(res.data || []))
      .catch(() => {});
  }, []);

  // GET /api/categories returns a 2-level tree (each parent carries a
  // `subcategories` array), but the filter should only offer the 9
  // top-level categories — subcategories are left out entirely.
  const categoryOptions = categoryTree.map((parent) => ({
    value: parent.id,
    label: categoryLabel(parent, t),
  }));

  const conditionOptions = CONDITIONS.map((c) => ({
    value: c.value,
    label:
      c.value === 'brand_new'
        ? t('listings.brandNew')
        : c.value === 'lightly_used'
        ? t('listings.lightlyUsed')
        : t('listings.used'),
  }));

  const priceRangeOptions = PRICE_RANGES.map((r) => ({
    value: r.value,
    label:
      r.min === 0
        ? t('listings.underAmount', { amount: r.max.toLocaleString('en-US') })
        : r.max === null
        ? t('listings.overAmount', { amount: r.min.toLocaleString('en-US') })
        : t('listings.rangeAmount', { min: r.min.toLocaleString('en-US'), max: r.max.toLocaleString('en-US') }),
  }));

  const cityOptions = CITIES.map((city) => ({ value: city.value, label: t(`cities.${city.key}`) }));

  // The price filter is a single "bucket" dropdown (e.g. "5,000 –
  // 20,000 ETB") instead of two free-typed min/max fields. Its value
  // encodes "min-max" (either side can be blank for unbounded), which
  // we translate into the two underlying min_price/max_price filters
  // the search API actually takes.
  const priceRangeValue =
    filters.min_price || filters.max_price ? `${filters.min_price}-${filters.max_price}` : '';

  function handlePriceRangeChange(e) {
    const [min, max] = e.target.value.split('-');
    onChange('min_price', min || '');
    onChange('max_price', max || '');
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder={t('listings.searchPlaceholder')}
        value={filters.q}
        onChange={(e) => onChange('q', e.target.value)}
      />
      <Select
        placeholder={t('listings.allCategories')}
        value={filters.category_id}
        onChange={(e) => onChange('category_id', e.target.value)}
        options={categoryOptions}
      />
      <Select
        placeholder={t('listings.anyCondition')}
        value={filters.condition}
        onChange={(e) => onChange('condition', e.target.value)}
        options={conditionOptions}
      />
      <Select
        placeholder={t('listings.anyPrice')}
        value={priceRangeValue}
        onChange={handlePriceRangeChange}
        options={priceRangeOptions}
      />
      <Select
        placeholder={t('listings.allCities')}
        value={filters.city}
        onChange={(e) => onChange('city', e.target.value)}
        options={cityOptions}
      />
    </div>
  );
}
