// Thin wrapper around the Chapa API (https://developer.chapa.co).
// Uses the built-in `fetch` (Node 18+) — no extra HTTP client dependency.
//
// Get your keys at https://dashboard.chapa.co — start with a TEST secret
// key (looks like CHASECK_TEST-...) and set it as CHAPA_SECRET_KEY in
// your .env. Switch to the live key only once you're ready to accept
// real payments.

const env = require('../config/env');
const ApiError = require('./ApiError');
const logger = require('./logger');

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

function requireConfigured() {
  if (!env.chapaSecretKey) {
    throw ApiError.internal(
      'Payments are not configured yet — set CHAPA_SECRET_KEY in the backend .env.'
    );
  }
}

// amount: number (ETB). email/first_name/last_name: buyer info Chapa
// requires on the hosted checkout page. tx_ref: our unique reference for
// this checkout (shared across every order row it covers). title/description
// show on Chapa's checkout page.
async function initializeTransaction({
  amount,
  email,
  first_name,
  last_name,
  tx_ref,
  title,
  description,
}) {
  requireConfigured();

  const res = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.chapaSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: 'ETB',
      email,
      first_name,
      last_name,
      tx_ref,
      callback_url: `${env.apiBaseUrl}/api/v1/orders/webhook`,
      return_url: `${env.frontendUrl}/orders/complete?tx_ref=${tx_ref}`,
      customization: {
        title: title.slice(0, 16), // Chapa caps this field at 16 chars
        description: description.slice(0, 200),
      },
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.status !== 'success') {
    logger.error('Chapa initialize failed', { status: res.status, data });
    throw ApiError.internal('Could not start payment — please try again.');
  }

  return { checkoutUrl: data.data.checkout_url };
}

// Always re-verify with Chapa's own API rather than trusting a webhook
// body or a frontend-supplied status — this is the one source of truth
// for whether money actually moved.
async function verifyTransaction(txRef) {
  requireConfigured();

  const res = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${env.chapaSecretKey}` },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    logger.error('Chapa verify failed', { status: res.status, data });
    throw ApiError.internal('Could not verify payment status.');
  }

  // Chapa returns status: "success" with data.status: "success" once the
  // transaction has actually settled.
  const paid = data.status === 'success' && data.data?.status === 'success';
  return { paid, raw: data };
}

module.exports = { initializeTransaction, verifyTransaction };
