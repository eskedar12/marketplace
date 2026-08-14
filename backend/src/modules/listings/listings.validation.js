const Joi = require('joi');

// Must match the DB enums exactly (listing_condition / listing_status in schema.sql)
const CONDITIONS = ['brand_new', 'lightly_used', 'fair_condition'];

const createListingSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).required(),
  price: Joi.number().positive().precision(2).required(),
  category_id: Joi.string().uuid().required(),
  condition: Joi.string().valid(...CONDITIONS).required(),
  city: Joi.string().max(100).required(),
  neighborhood: Joi.string().max(100).allow('', null).optional(),
});

const updateListingSchema = createListingSchema.fork(
  ['title', 'description', 'price', 'category_id', 'condition', 'city'],
  (schema) => schema.optional()
);

const searchQuerySchema = Joi.object({
  q: Joi.string().max(150).allow('').optional(),
  // Plain UUID for a single category, or a comma-separated list of UUIDs
  // (used by the category browse page to include subcategory listings).
  category_id: Joi.string()
    .pattern(/^[0-9a-fA-F-]{36}(,[0-9a-fA-F-]{36})*$/)
    .optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  city: Joi.string().max(100).allow('', null).optional(),
  neighborhood: Joi.string().max(100).allow('', null).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

module.exports = { createListingSchema, updateListingSchema, searchQuerySchema, CONDITIONS };