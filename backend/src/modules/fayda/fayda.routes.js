const express = require('express');
const controller = require('./fayda.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

// The mock login page is a plain HTML <form> POST (it has to be — it's
// standing in for a real hosted redirect, not an SPA fetch call), so
// this router needs form-body parsing. Scoped to just this router
// rather than added to app.js, since nothing else in the app needs it.
router.use(express.urlencoded({ extended: false }));

// app.js applies helmet() globally, whose default Content-Security-Policy
// is tuned for the React SPA and blocks a plain server-rendered <form>
// POST-ing back to this same origin ("form-action 'self'" was rejecting
// it in some browsers). This router serves real HTML pages, not JSON, so
// it gets its own minimal CSP instead — still same-origin-only and with
// no external scripts, so nothing here weakens the app's actual security.
//
// helmet's global default Referrer-Policy is "no-referrer". Per the
// Fetch spec, a same-origin page with "no-referrer" set is required to
// send `Origin: null` (not the page's real origin) on any non-GET
// request — so this router's own <form method="POST"> submissions were
// arriving with an Origin of the literal string "null", which the CORS
// allowlist in app.js correctly rejects (it isn't, and shouldn't be, in
// the allowlist). Overriding it to "strict-origin-when-cross-origin"
// here keeps the real Origin header on this router's same-origin POSTs
// without loosening the global default anywhere else in the app.
router.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; base-uri 'self'; frame-ancestors 'self'"
  );
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

router.get('/connect', requireAuth, controller.connect); // authed: starts verification
router.get('/mock/login', controller.mockLoginPage); // public: fake Fayda login screen
router.post('/mock/login', controller.mockLoginSubmit); // public: fake Fayda callback

module.exports = router;