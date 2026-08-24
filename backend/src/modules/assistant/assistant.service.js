// Backs the little "?" chat widget in the corner of the app. Uses the
// built-in `fetch` (Node 18+) — no extra HTTP client dependency, same
// as utils/chapa.js. Calls Google's Gemini API (the Flash models are
// covered by a genuine free tier — no credit card, no trial period).
//
// Get a free API key at https://aistudio.google.com/apikey (sign in
// with any Google account) and set it as GEMINI_API_KEY in your .env.

const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

function requireConfigured() {
  if (!env.geminiApiKey) {
    throw ApiError.internal(
      'The page assistant is not configured yet — set GEMINI_API_KEY in the backend .env.'
    );
  }
}

// One short, honest description per page — written here rather than
// trusted from the client request, so the assistant's grounding can't
// be hijacked by tampering with the request body. Keep this in sync
// with routes/AppRouter.jsx on the frontend when pages are added/renamed.
const PAGE_DESCRIPTIONS = {
  home: 'The homepage — featured/recent listings across all 9 categories, with a search bar and category shortcuts.',
  listings: 'The browse/search results page — every active listing, with filters for category, price range, condition, and location.',
  category: 'A single category page (e.g. Electronics), showing its subcategories as filter pills and the listings inside it.',
  listingDetail:
    'A single listing\'s detail page — photos, price, condition, seller info, a "Buy Now" button, an "Add to Cart" button, and a way to message the seller.',
  login: 'The login page.',
  register:
    'The signup page — choosing a name, email, password, phone, city, and whether the account is a buyer or a seller account.',
  profile:
    "The signed-in user's own account/profile page — editable name, phone, city, neighborhood, and a call-visibility toggle.",
  publicProfile: "Another user's public seller profile — their rating, and their active listings.",
  myListings: "A seller's own listings — active and sold, editable/deletable from here.",
  sell: 'The "create a new listing" form — title, description, price, condition, category, and photos.',
  editListing: 'The "edit an existing listing" form.',
  favorites: "The signed-in user's saved/favorited listings.",
  notifications: 'The notifications list — things like "your listing sold" or a new message.',
  cart: 'The shopping cart — listings queued up to buy together in one checkout.',
  orders: 'Past orders, both as a buyer and as a seller, with their payment status.',
  orderComplete: 'The confirmation page shown right after a successful checkout.',
  messages: 'The inbox — conversations with other buyers/sellers about specific listings.',
  messageThread: 'One conversation thread with another user about a specific listing.',
  help: 'The Help Center — links to guides on buying, selling, payment safety, and contacting support.',
  howToBuy: 'A help article explaining how to buy on the marketplace.',
  howToSell: 'A help article explaining how to sell on the marketplace.',
  paymentSafety: 'A help article about paying safely (via Chapa) and avoiding scams.',
  contactSupport: 'A page for contacting support.',
  safety: 'The Safety Center — general safety tips for meeting up and trading.',
  about: 'The "About Us" page.',
  mission: 'The "Our Mission" page.',
  terms: 'The Terms of Use page.',
  privacy: 'The Privacy Policy page.',
  notFound: 'A 404 "page not found" page.',
};

const LANGUAGE_NAMES = { en: 'English', am: 'Amharic', ti: 'Tigrinya', om: 'Afaan Oromo' };

function buildSystemPrompt(page, pageDetails, language) {
  const pageDesc = PAGE_DESCRIPTIONS[page] || 'An unrecognized page.';

  const details = [];
  if (pageDetails.categoryName) details.push(`Category shown: "${pageDetails.categoryName}".`);
  if (pageDetails.listingTitle) {
    details.push(
      `Listing shown: "${pageDetails.listingTitle}"${pageDetails.listingPrice ? ` (${pageDetails.listingPrice})` : ''}.`
    );
  }

  // Every page on the site, not just the one they're currently on — so a
  // question like "how do I sell something?" asked from the homepage, or
  // "how do I get my money" asked from a listing page, still gets a real
  // answer instead of "I can only help with this page."
  const siteMap = Object.entries(PAGE_DESCRIPTIONS)
    .filter(([key]) => key !== 'notFound')
    .map(([, desc]) => `- ${desc}`)
    .join('\n');

  return `You are the built-in help assistant for ReGebeya, an Ethiopian online classifieds marketplace (electronics, furniture, fashion, vehicles, books, tools, jewelry, office supplies, and more). You appear as a small chat widget in the corner of the page.

Here is every page on the site, so you can answer questions about parts of the site the user isn't currently looking at:
${siteMap}

The user is currently on: ${pageDesc}
${details.join(' ')}

Your job is to help them understand and use *any part of the site* — what things do, how to complete common tasks (posting a listing, checking out, messaging a seller, editing their profile, rating a seller, etc.), and general questions about how the marketplace works — not just the page they happen to be on right now.

Rules:
- Answer in ${LANGUAGE_NAMES[language] || 'English'}.
- Keep answers short — 1-3 sentences, chat-widget length, not an essay.
- You don't have access to the user's account, orders, or messages — if asked something account-specific, say you can't see that and point them to the relevant page instead of guessing.
- You can't click anything or navigate for them — only describe what to do and, if relevant, which page to go to.
- If asked something unrelated to the marketplace, briefly say that's outside what you can help with here.
- Never invent prices, policies, or features that weren't described to you above.`;
}

async function ask({ message, page, pageDetails, language, history }) {
  requireConfigured();

  // Gemini uses 'user' / 'model' instead of 'user' / 'assistant', and
  // takes the system prompt as a separate field rather than a message
  // in the list.
  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.assistantModel}:generateContent?key=${env.geminiApiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: buildSystemPrompt(page, pageDetails, language) }] },
      generationConfig: {
        maxOutputTokens: 800,
        // Gemini 3 models "think" before answering by default, and that
        // thinking is deducted from the SAME maxOutputTokens budget as the
        // visible reply — with a low token cap and no thinking control,
        // the model can burn its entire budget thinking and leave nothing
        // (or a truncated fragment) for the actual answer. This widget
        // needs short, fast FAQ-style replies, not deep reasoning, so
        // thinking is capped to 'low' rather than left at its default.
        thinkingConfig: { thinkingLevel: 'low' },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.error(`Assistant: Gemini API returned ${res.status}`, body);

    if (res.status === 429) {
      // Distinguish "we're out of quota" from a genuine outage — this is
      // by far the most common failure on the free tier, and the generic
      // message left people thinking the feature was broken.
      throw ApiError.internal(
        'The assistant has hit its usage limit for now — please try again in a minute.'
      );
    }

    throw ApiError.internal('The assistant is temporarily unavailable — please try again shortly.');
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .join('')
    .trim();

  if (!reply) {
    throw ApiError.internal('The assistant did not return a response — please try again.');
  }

  return { reply };
}

module.exports = { ask };
