// Per-category visual theme for the Home hero section. Swapping the
// background photo + headline based on the selected category is
// what makes each category feel like its own "page" while still
// technically being the same Home component (so the rest of the
// page — Browse by Category, Why ReGebeya, CTA — never has to
// remount).
//
// `keyword` feeds the placeholder photo service used elsewhere in
// constants.js & the real listings API. Keywords are picked to be single, unambiguous,
// highly-photographed objects (a phone, a sofa, a car...) so the
// hero clearly reads as "this category" at a glance rather than a
// vague, on-theme-but-abstract shot.

export const DEFAULT_HERO_THEME = {
  keyword: 'marketplace,flea-market',
  image: '/hero.jpg',
  headlineLead: 'Every',
  headlineHighlight: 'kinda',
  headlineTail: 'thing, for every kinda person.',
};

export const HERO_THEMES = {
  electronics: {
    keyword: 'smartphone,laptop',
    image: '/electronics.jpg',
    headlineLead: 'Every',
    headlineHighlight: 'gadget',
    headlineTail: 'you need, at a price that makes sense.',
  },
  furniture: {
    keyword: 'sofa,livingroom',
    image: '/furniture.jpg',
    headlineLead: 'Furnish',
    headlineHighlight: 'your home',
    headlineTail: 'without paying for new.',
  },
  apparel: {
    keyword: 'clothing,fashion',
    image: '/apparel.jpg',
    headlineLead: 'Refresh',
    headlineHighlight: 'your style',
    headlineTail: 'for less than you think.',
  },
  vehicles: {
    keyword: 'car,automobile',
    image: '/vehicle.jpg',
    // the public folder and set image: '/vehicles.jpg' here.
    headlineLead: 'Find',
    headlineHighlight: 'your ride',
    headlineTail: 'from trusted local sellers.',
  },
  'household-appliances': {
    keyword: 'refrigerator,kitchen',
    // TODO: no local image yet for this category — add
    // /household-appliances.jpg to the public folder and set
    // image: '/household-appliances.jpg' here.
    headlineLead: 'Every',
    headlineHighlight: 'appliance',
    headlineTail: 'your home has been missing.',
  },
  books: {
    keyword: 'bookshelf,books',
    image: '/books.jpg',
    headlineLead: 'Great',
    headlineHighlight: 'reads',
    headlineTail: 'waiting for a new shelf.',
  },
  tools: {
    keyword: 'toolbox,workshop',
    image: '/tools.jpg',
    headlineLead: 'Get the',
    headlineHighlight: 'job done',
    headlineTail: 'with tools that already work.',
  },
  jewelry: {
    keyword: 'necklace,ring',
    image: '/jewelry.jpg',
    headlineLead: 'Find',
    headlineHighlight: 'your perfect piece',
    headlineTail: 'without the premium price tag.',
  },
  office: {
    keyword: 'office,desk',
    image: '/office.jpg',
    headlineLead: 'Set up',
    headlineHighlight: 'your workspace',
    headlineTail: 'for a fraction of retail.',
  },
  other: DEFAULT_HERO_THEME,
};

export function getHeroTheme(dbSlug) {
  return (dbSlug && HERO_THEMES[dbSlug]) || DEFAULT_HERO_THEME;
}