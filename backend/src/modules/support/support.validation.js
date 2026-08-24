const Joi = require('joi');

const contactSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().max(150).required(),
  subject: Joi.string().min(1).max(150).required(),
  message: Joi.string().min(1).max(3000).required(),
});

module.exports = { contactSchema };
