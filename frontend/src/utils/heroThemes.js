// Per-category visual theme for the Home hero section. Swapping the
// background photo + headline based on the selected category is
// what makes each category feel like its own "page" while still
// technically being the same Home component (so the rest of the
// page — Browse by Category, Why ReGebeya, CTA — never has to
// remount).
//
// `keyword` feeds the placeholder photo service used elsewhere in
// mockListings.js. Keywords are picked to be single, unambiguous,
// highly-photographed objects (a phone, a sofa, a car...) so the
// hero clearly reads as "this category" at a glance rather than a
// vague, on-theme-but-abstract shot.

export const DEFAULT_HERO_THEME = {
  keyword: 'marketplace,flea-market',
  headlineLead: 'Every',
  headlineHighlight: 'kinda',
  headlineTail: 'thing, for every kinda person.',
};

export const HERO_THEMES = {
  electronics: {
    keyword: 'smartphone,laptop',
    headlineLead: 'Every',
    headlineHighlight: 'gadget',
    headlineTail: 'you need, at a price that makes sense.',
  },
  furniture: {
    keyword: 'sofa,livingroom',
    headlineLead: 'Furnish',
    headlineHighlight: 'your home',
    headlineTail: 'without paying for new.',
  },
  apparel: {
    keyword: 'clothing,fashion',
    headlineLead: 'Refresh',
    headlineHighlight: 'your style',
    headlineTail: 'for less than you think.',
  },
  vehicles: {
    keyword: 'car,automobile',
    headlineLead: 'Find',
    headlineHighlight: 'your ride',
    headlineTail: 'from trusted local sellers.',
  },
  'household-appliances': {
    keyword: 'refrigerator,kitchen',
    headlineLead: 'Every',
    headlineHighlight: 'appliance',
    headlineTail: 'your home has been missing.',
  },
  books: {
    keyword: 'bookshelf,books',
    headlineLead: 'Great',
    headlineHighlight: 'reads',
    headlineTail: 'waiting for a new shelf.',
  },
  tools: {
    keyword: 'toolbox,workshop',
    headlineLead: 'Get the',
    headlineHighlight: 'job done',
    headlineTail: 'with tools that already work.',
  },
  hobbies: {
    keyword: 'guitar,hobby',
    headlineLead: 'Pick up',
    headlineHighlight: 'a new hobby',
    headlineTail: 'without the new-price tag.',
  },
  office: {
    keyword: 'office,desk',
    headlineLead: 'Set up',
    headlineHighlight: 'your workspace',
    headlineTail: 'for a fraction of retail.',
  },
  other: DEFAULT_HERO_THEME,
};

export function getHeroTheme(dbSlug) {
  return (dbSlug && HERO_THEMES[dbSlug]) || DEFAULT_HERO_THEME;
}
