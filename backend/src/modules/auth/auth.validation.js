const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  phone: Joi.string().max(20).required(),
  city: Joi.string().max(100).required(),
  neighborhood: Joi.string().max(100).allow('', null).optional(),
  role: Joi.string().valid('buyer', 'seller').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };