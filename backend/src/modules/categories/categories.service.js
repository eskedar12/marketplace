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

module.exports = { getCategoryTree };
