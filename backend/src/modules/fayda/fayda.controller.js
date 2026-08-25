const asyncHandler = require('../../utils/asyncHandler');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const faydaService = require('./fayda.service');

// GET /fayda/connect — authed. Returns the URL the frontend should do a
// full-page navigation to (not an axios call) — real Fayda, and our
// mock stand-in for it, both need the browser to actually leave the
// SPA the way a real hosted login does.
const connect = asyncHandler(async (req, res) => {
  const state = faydaService.createConnectState(req.user.id);
  const authorizeUrl = faydaService.buildAuthorizeUrl(state);
  res.json({ success: true, data: { authorizeUrl } });
});

// GET /fayda/mock/login — public. Stands in for Fayda's hosted login
// page. Deliberately looks nothing like a real government site, so
// nobody mistakes this for the genuine Fayda login screen.
const mockLoginPage = asyncHandler(async (req, res) => {
  const { state } = req.query;

  // Validate up front so a stale/tampered link fails here with a
  // readable message instead of on submit.
  try {
    faydaService.verifyConnectState(state);
  } catch (err) {
    return res.status(400).send(mockErrorHtml(err.message));
  }

  res.send(mockLoginHtml(state));
});

// POST /fayda/mock/login — public. Simulates the user approving the
// login on Fayda's side, then redirects back to the frontend exactly
// like a real callback would — success/error communicated only via
// query params, since this is a full browser redirect, not an API call.
const mockLoginSubmit = asyncHandler(async (req, res) => {
  const { state, action } = req.body;

  if (action !== 'approve') {
    return res.redirect(`${env.frontendUrl}/profile?fayda=cancelled`);
  }

  try {
    await faydaService.completeMockLogin(state);
  } catch (err) {
    logger.error('Mock Fayda login failed', { message: err.message });
    return res.redirect(`${env.frontendUrl}/profile?fayda=error`);
  }

  res.redirect(`${env.frontendUrl}/profile?fayda=success`);
});

function mockLoginHtml(state) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Fayda Verification (MOCK)</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, sans-serif; background: #f2f2f0; margin: 0; padding: 40px 16px; display: flex; justify-content: center; }
  .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 380px; width: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  .banner { background: #fef3cd; border: 1px solid #f0d878; color: #6b5a12; font-size: 13px; padding: 10px 12px; border-radius: 8px; margin-bottom: 20px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p.sub { color: #666; font-size: 13px; margin: 0 0 24px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  button { width: 100%; padding: 12px; border-radius: 8px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 12px; }
  .approve { background: #2f7d4f; color: #fff; }
  .cancel { background: transparent; color: #999; }
</style>
</head>
<body>
  <div class="card">
    <div class="banner">⚠️ This is a MOCK screen for local development — it is not affiliated with the Ethiopian government or the real Fayda eSignet service.</div>
    <h1>Fayda eSignet</h1>
    <p class="sub">Sign in to verify your identity with VinTech Marketplace</p>
    <div class="row"><span>Full name</span><span>Test User</span></div>
    <div class="row"><span>Fayda ID</span><span>•••• •••• 1234</span></div>
    <form method="POST" action="/api/v1/fayda/mock/login">
      <input type="hidden" name="state" value="${escapeHtml(state)}" />
      <input type="hidden" name="action" value="approve" />
      <button type="submit" class="approve">Approve &amp; Continue</button>
    </form>
    <form method="POST" action="/api/v1/fayda/mock/login">
      <input type="hidden" name="state" value="${escapeHtml(state)}" />
      <input type="hidden" name="action" value="cancel" />
      <button type="submit" class="cancel">Cancel</button>
    </form>
  </div>
</body>
</html>`;
}

function mockErrorHtml(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Fayda Verification (MOCK)</title></head>
<body style="font-family: -apple-system, sans-serif; padding: 40px; text-align: center;">
  <p>${escapeHtml(message)}</p>
  <p><a href="${env.frontendUrl}/profile">Return to profile</a></p>
</body>
</html>`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { connect, mockLoginPage, mockLoginSubmit };
