const ApiError = require('../utils/ApiError');

// Generic Joi runner. Usage: validate(schema) or validate(schema, 'query')
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => d.message);
    throw ApiError.badRequest('Validation failed', details);
  }

  req[property] = value;
  next();
};

module.exports = validate;
