const asyncHandler = require('../../utils/asyncHandler');
const categoriesService = require('./categories.service');

const getAll = asyncHandler(async (req, res) => {
  const categories = await categoriesService.getCategoryTree();
  res.json({ success: true, data: categories });
});

const getBySlug = asyncHandler(async (req, res) => {
  const category = await categoriesService.getCategoryBySlugWithSubtree(req.params.slug);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  res.json({ success: true, data: category });
});

module.exports = { getAll, getBySlug };