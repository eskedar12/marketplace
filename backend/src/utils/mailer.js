// Thin wrapper around Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
// Uses the built-in `fetch` (Node 18+) — no extra HTTP client dependency,
// same as chapa.js and assistant.service.js.
//
// Get a free API key (no credit card required) at
// https://resend.com/api-keys and set it as RESEND_API_KEY in your .env.
// Also set SUPPORT_INBOX_EMAIL to whichever address should receive
// Contact Support submissions.

const env = require('../config/env');
const ApiError = require('./ApiError');
const logger = require('./logger');

const RESEND_BASE_URL = 'https://api.resend.com';

function requireConfigured() {
  if (!env.resendApiKey || !env.supportInboxEmail) {
    throw ApiError.internal(
      'Contact Support is not configured yet — set RESEND_API_KEY and SUPPORT_INBOX_EMAIL in the backend .env.'
    );
  }
}

// Sends a plain-text email. `replyTo` is set to the submitter's own
// address so hitting "Reply" in your inbox goes straight back to them,
// not to the from address Resend sends as.
async function sendEmail({ subject, text, replyTo }) {
  requireConfigured();

  const res = await fetch(`${RESEND_BASE_URL}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `ReGebeya <${env.supportFromEmail}>`,
      to: [env.supportInboxEmail],
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.error('Resend send failed', res.status, body);
    throw ApiError.internal('Failed to send email — please try again shortly.');
  }

  return res.json();
}

module.exports = { sendEmail };
