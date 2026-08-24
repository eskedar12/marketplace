const Joi = require('joi');

// Every page the widget can be opened on. Keeping this as a closed
// enum (rather than accepting free text) means the client can only
// ever select one of the descriptions assistant.service.js already
// knows about server-side — it can't smuggle in arbitrary instructions
// by tampering with the request body.
const PAGE_KEYS = [
  'home',
  'listings',
  'category',
  'listingDetail',
  'login',
  'register',
  'profile',
  'publicProfile',
  'myListings',
  'sell',
  'editListing',
  'favorites',
  'notifications',
  'cart',
  'orders',
  'orderComplete',
  'messages',
  'messageThread',
  'help',
  'howToBuy',
  'howToSell',
  'paymentSafety',
  'contactSupport',
  'safety',
  'about',
  'mission',
  'terms',
  'privacy',
  'notFound',
];

const askSchema = Joi.object({
  message: Joi.string().min(1).max(500).required(),
  page: Joi.string()
    .valid(...PAGE_KEYS)
    .required(),
  // A few already-public, short display strings about what's loaded on
  // the page right now (e.g. the listing title on a listing page), so
  // the assistant can be specific instead of generic. Capped so one
  // request can't be used to pad the prompt.
  pageDetails: Joi.object({
    categoryName: Joi.string().max(80).allow(''),
    listingTitle: Joi.string().max(200).allow(''),
    listingPrice: Joi.string().max(40).allow(''),
  }).default({}),
  language: Joi.string().valid('en', 'am', 'ti', 'om').default('en'),
  // Short rolling history so follow-up questions work without a
  // backend session — capped hard so one conversation can't balloon
  // token usage. The widget only ever sends its own last few turns.
  history: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().max(500).required(),
      })
    )
    .max(8)
    .default([]),
});

module.exports = { askSchema, PAGE_KEYS };
