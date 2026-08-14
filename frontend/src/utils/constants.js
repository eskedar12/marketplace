// Cities served by the marketplace. Used by the Home page's city
// picker and the listings FilterBar. Kept as a small static list
// (rather than derived from the DB) since it rarely changes and the
// signup/listing forms already constrain city input to these values.
export const CITIES = [
  'Addis Ababa',
  'Adama',
  'Hawassa',
  'Bahir Dar',
  'Dire Dawa',
  'Mekelle',
  'Gondar',
  'Dessie',
  'Jimma',
];

// Preset price brackets for the listings filter, so the user picks a
// range from a dropdown instead of typing exact min/max ETB values.
// value encodes "min-max" (empty side = unbounded), parsed by
// FilterBar into filters.min_price / filters.max_price.
export const PRICE_RANGES = [
  { label: 'Under 1,000 ETB', value: '0-1000' },
  { label: '1,000 – 5,000 ETB', value: '1000-5000' },
  { label: '5,000 – 20,000 ETB', value: '5000-20000' },
  { label: '20,000 – 50,000 ETB', value: '20000-50000' },
  { label: '50,000 – 200,000 ETB', value: '50000-200000' },
  { label: 'Over 200,000 ETB', value: '200000-' },
];

