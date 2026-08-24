const Joi = require('joi');

// Mirrors the pattern used by auth.validation.js / listings.validation.js.
// Content is free text typed by one user and shown directly to another,
// so it's worth validating server-side even though the frontend already
// trims the draft before sending — a stray empty POST or a pasted wall
// of text shouldn't reach the database untouched.
const sendMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Message cannot be empty',
    'string.max': 'Message is too long (max 2000 characters)',
  }),
});

module.exports = { sendMessageSchema };
