const categoriesRepository = require('./categories.repository');

// Nests subcategories under their parent so the frontend can render a
// two-level dropdown/menu without doing the grouping itself.
async function getCategoryTree() {
  const all = await categoriesRepository.findAll();
  const parents = all.filter((c) => !c.parent_id);
  return parents.map((parent) => ({
    ...parent,
    subcategories: all.filter((c) => c.parent_id === parent.id),
  }));
}

// Powers the category browse page. Works for both a parent slug
// ("electronics") and a subcategory slug ("phones") — includes the
// parent (for a breadcrumb), the subcategories (for pill filters),
// and categoryIds: every id whose listings belong on this page.
async function getCategoryBySlugWithSubtree(slug) {
  const all = await categoriesRepository.findAll();
  const match = all.find((c) => c.slug === slug);
  if (!match) return null;

  const subcategories = all.filter((c) => c.parent_id === match.id);
  const parent = match.parent_id ? all.find((c) => c.id === match.parent_id) || null : null;
  const categoryIds = [match.id, ...subcategories.map((s) => s.id)];

  return { ...match, subcategories, parent, categoryIds };
}

// Listings must be tagged with a leaf (sub)category — never a parent —
// so they actually show up when a buyer filters by a specific
// subcategory pill (e.g. "Cars"), instead of only surfacing under
// "All". A category is a leaf if some other row points at it as a
// parent_id; anything with no children is a leaf, including a
// top-level category that was never given subcategories.
async function isLeafCategory(categoryId) {
  const category = await categoriesRepository.findById(categoryId);
  if (!category) return false;
  const all = await categoriesRepository.findAll();
  const hasChildren = all.some((c) => c.parent_id === categoryId);
  return !hasChildren;
}

module.exports = { getCategoryTree, getCategoryBySlugWithSubtree, isLeafCategory };