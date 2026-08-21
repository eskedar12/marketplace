// Cities served by the marketplace. Used by the Home page's city
// picker and the listings FilterBar. Kept as a small static list
// (rather than derived from the DB) since it rarely changes and the
// signup/listing forms already constrain city input to these values.
// `value` stays in English since it's matched against listing.city
// coming from the backend; `key` looks up the translated display
// label in translations.js's `cities` namespace.
export const CITIES = [
  { value: 'Addis Ababa', key: 'addisAbaba' },
  { value: 'Adama', key: 'adama' },
  { value: 'Hawassa', key: 'hawassa' },
  { value: 'Bahir Dar', key: 'bahirDar' },
  { value: 'Dire Dawa', key: 'direDawa' },
  { value: 'Mekelle', key: 'mekelle' },
  { value: 'Gondar', key: 'gondar' },
  { value: 'Dessie', key: 'dessie' },
  { value: 'Jimma', key: 'jimma' },
];

// Preset price brackets for the listings filter, so the user picks a
// range from a dropdown instead of typing exact min/max ETB values.
// value encodes "min-max" (empty side = unbounded), parsed by
// FilterBar into filters.min_price / filters.max_price. Labels are
// built at render time via FilterBar's t() so they translate; this
// array only carries the boundaries.
// Looks up the translated display label for a city value coming back
// from the backend (listing.city, profile.city, filters.city, etc).
// Matching is case-insensitive (and trims whitespace) so listings
// created before the city dropdown existed — which may have
// free-typed casing like "addis ababa" — still get translated instead
// of silently falling through to the raw value. Anything that still
// doesn't match (a city genuinely not in the CITIES list) falls back
// to the raw value itself, so nothing breaks.
export function cityLabel(value, t) {
  if (!value) return value;
  const normalized = value.trim().toLowerCase();
  const city = CITIES.find((c) => c.value.toLowerCase() === normalized);
  return city ? t(`cities.${city.key}`) : value;
}

export const PRICE_RANGES = [
  { min: 0, max: 1000, value: '0-1000' },
  { min: 1000, max: 5000, value: '1000-5000' },
  { min: 5000, max: 20000, value: '5000-20000' },
  { min: 20000, max: 50000, value: '20000-50000' },
  { min: 50000, max: 200000, value: '50000-200000' },
  { min: 200000, max: null, value: '200000-' },
];

