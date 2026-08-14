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

module.exports = { getCategoryTree, getCategoryBySlugWithSubtree };