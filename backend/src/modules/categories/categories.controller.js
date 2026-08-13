const asyncHandler = require('../../utils/asyncHandler');
const categoriesService = require('./categories.service');

const getAll = asyncHandler(async (req, res) => {
  const categories = await categoriesService.getCategoryTree();
  res.json({ success: true, data: categories });
});

module.exports = { getAll };
