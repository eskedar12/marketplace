// Fayda (Ethiopian national digital ID) verification.
//
// MOCK MODE (default): instead of redirecting to Fayda's real eSignet
// login, /fayda/connect sends the browser to our own mock-login page
// (fayda.controller.js), which fakes an "approve" click and calls back
// into completeMockLogin below. No real Fayda credentials, RSA keys,
// or network calls are involved — this only exists so the rest of the
// app (button, redirect flow, DB update, verified badge) can be built
// and tested before real Fayda API access (id.gov.et/api, ~2 business
// days) comes through.
//
// REAL MODE (later): once FAYDA_MOCK_MODE=false and the FAYDA_* env
// vars are filled in, replace buildAuthorizeUrl's mock branch with a
// real Fayda OIDC authorize URL, and add a callback handler that
// exchanges the code for tokens and verifies the id_token against
// Fayda's JWKS before calling completeVerification. Everything else
// in this file (state signing, uniqueness check, DB update) stays
// the same either way.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const usersRepository = require('../users/users.repository');

const STATE_PURPOSE = 'fayda_connect';
const STATE_EXPIRY = '5m';

// Signs a short-lived token identifying which user started this
// verification attempt. Fayda's callback is a plain browser redirect
// with no Authorization header, so this — not the JWT the user is
// normally logged in with — is how we know whose account to update
// when the browser comes back.
function createConnectState(userId) {
  return jwt.sign({ sub: userId, purpose: STATE_PURPOSE }, env.jwtSecret, {
    expiresIn: STATE_EXPIRY,
  });
}

function verifyConnectState(state) {
  let payload;
  try {
    payload = jwt.verify(state, env.jwtSecret);
  } catch (err) {
    throw ApiError.badRequest('This verification link has expired — please try again.');
  }
  if (payload.purpose !== STATE_PURPOSE) {
    throw ApiError.badRequest('Invalid verification link.');
  }
  return payload.sub; // userId
}

function buildAuthorizeUrl(state) {
  if (env.faydaMockMode) {
    return `${env.apiBaseUrl}/api/v1/fayda/mock/login?state=${encodeURIComponent(state)}`;
  }

  // Real Fayda eSignet OIDC authorize URL — needs FAYDA_CLIENT_ID and
  // FAYDA_AUTHORIZE_URL from your relying-party registration, plus a
  // matching /fayda/callback route that exchanges the code and
  // verifies the id_token signature against FAYDA_JWKS_URL. Not
  // implemented yet — see the file header.
  if (!env.faydaClientId || !env.faydaAuthorizeUrl) {
    throw ApiError.internal(
      'Real Fayda verification is not configured yet. Set FAYDA_MOCK_MODE=true to use the mock flow, or fill in the FAYDA_* env vars once you have real credentials.'
    );
  }
  const params = new URLSearchParams({
    client_id: env.faydaClientId,
    response_type: 'code',
    scope: 'openid profile',
    redirect_uri: `${env.apiBaseUrl}/api/v1/fayda/callback`,
    state,
  });
  return `${env.faydaAuthorizeUrl}?${params.toString()}`;
}

// Shared by mock and (eventually) real callbacks: links the Fayda
// identity to the user and flips is_verified, enforcing that one
// Fayda identity can only ever be linked to one marketplace account.
async function completeVerification(userId, faydaSub) {
  const existing = await usersRepository.findByFaydaSub(faydaSub);
  if (existing && existing.id !== userId) {
    throw ApiError.conflict('This Fayda ID is already linked to a different account.');
  }

  return usersRepository.updateUser(userId, {
    fayda_sub: faydaSub,
    is_verified: true,
    fayda_verified_at: new Date(),
  });
}

// Mock-only: stands in for the id_token's `sub` claim a real Fayda
// login would return. Prefixed so it's obviously never mistaken for
// a real Fayda identifier if it ever leaks into logs or a real DB.
function generateMockFaydaSub() {
  return `MOCK-${crypto.randomBytes(8).toString('hex')}`;
}

async function completeMockLogin(state) {
  const userId = verifyConnectState(state);
  const faydaSub = generateMockFaydaSub();
  return completeVerification(userId, faydaSub);
}

module.exports = {
  createConnectState,
  verifyConnectState,
  buildAuthorizeUrl,
  completeMockLogin,
};
