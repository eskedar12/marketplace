require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // Fail fast — a missing secret at runtime is worse than a crash at boot.
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    // 100 was fine before the app added background polling (the
    // notification bell + unread-messages badge each check in every
    // 30s), but that alone is ~60 requests/15min per person just
    // sitting idle — on top of normal browsing, a shared limit of 100
    // for the *entire* API gets hit almost immediately. 1000 leaves
    // real headroom for that plus normal use; override via
    // RATE_LIMIT_MAX in production if you want it tighter.
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000,
  },
  // Not in `required` above — checked lazily in chapa.js at the moment a
  // checkout is actually attempted, so the rest of the app still boots
  // fine before payments are configured.
  chapaSecretKey: process.env.CHAPA_SECRET_KEY,
  // Where Chapa sends the buyer back after paying, and where Chapa calls
  // server-to-server to confirm payment. Falls back to localhost so local
  // dev works out of the box; override both in production.
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  // Not in `required` above — checked lazily in assistant.service.js at
  // the moment someone actually opens the chat widget, so the rest of
  // the app still boots fine before it's configured. Get a free key
  // (no credit card needed) at https://aistudio.google.com/apikey.
  geminiApiKey: process.env.GEMINI_API_KEY,
  // Flash models are the ones covered by Gemini's free tier — Pro
  // models are paid-only. Google retires old model names over time
  // (gemini-2.5-flash was the default here originally; as of writing
  // it's been replaced by gemini-3.6-flash) — if this ever 404s with
  // "no longer available", check https://ai.google.dev/gemini-api/docs/models
  // for the current free-tier model name and update this default.
  // NOTE: assistant.service.js's thinkingConfig uses `thinkingLevel`,
  // which only Gemini 3.x models understand — if you point this at a
  // Gemini 2.5 model instead, swap it for `thinkingBudget` (a number)
  // or replies may silently ignore the thinking cap and truncate again.
  assistantModel: process.env.ASSISTANT_MODEL || 'gemini-3.6-flash',
  // Not in `required` above — checked lazily in support.service.js at the
  // moment someone actually submits the Contact Support form, so the rest
  // of the app still boots fine before it's configured. Get a free key
  // (no credit card, no domain needed to start) at https://resend.com/api-keys.
  resendApiKey: process.env.RESEND_API_KEY,
  // The inbox that Contact Support submissions get forwarded to — set
  // this to your own address.
  supportInboxEmail: process.env.SUPPORT_INBOX_EMAIL,
  // The "from" address Resend sends as. Defaults to Resend's own shared
  // sandbox address, which works immediately with no setup — swap in
  // something like support@yourdomain.com once you've verified a domain
  // at https://resend.com/domains.
  supportFromEmail: process.env.SUPPORT_FROM_EMAIL || 'onboarding@resend.dev',
  // Fayda (Ethiopian national digital ID) verification. Real Fayda
  // eSignet access (id.gov.et/api) takes days to be granted, so this
  // defaults to a MOCK flow: src/modules/fayda serves its own fake
  // "login" page instead of redirecting to Fayda, so the whole
  // connect -> approve -> callback -> verified loop can be built and
  // tested today. Set FAYDA_MOCK_MODE=false and fill in the FAYDA_*
  // values below once real credentials arrive — nothing else in the
  // app needs to change, only src/modules/fayda/fayda.service.js.
  faydaMockMode: process.env.FAYDA_MOCK_MODE !== 'false',
  faydaClientId: process.env.FAYDA_CLIENT_ID,
  faydaAuthorizeUrl: process.env.FAYDA_AUTHORIZE_URL,
  faydaTokenUrl: process.env.FAYDA_TOKEN_URL,
  faydaUserinfoUrl: process.env.FAYDA_USERINFO_URL,
  faydaJwksUrl: process.env.FAYDA_JWKS_URL,
};
