# ReGebeya Used Goods Marketplace — Frontend

React + Vite + Tailwind + Axios frontend for **ReGebeya**, a peer-to-peer
secondhand marketplace. One app, role-aware routes for both buyer and
seller, with built-in bilingual support and theming.

## Setup

```bash
npm install
cp .env.example .env
# edit .env — VITE_API_URL should point at your backend
npm run dev
```

Runs on http://localhost:5173. Your backend must be running and its CORS
config (`FRONTEND_URL`) must allow this origin.

> **Heads up — `.env.example` needs fixing before this works as
> written.** The shipped `.env.example` is currently a copy of the
> *backend's* file (`NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`,
> rate-limit vars) — none of which the frontend reads. The only env var
> the code actually looks for is `VITE_API_URL`
> (`src/api/axiosClient.js`), which isn't in there at all. Replace the
> file's contents with:
> ```bash
> VITE_API_URL=http://localhost:5000/api/v1
> ```
> Until that's fixed, `npm run dev` will still technically run — the
> code falls back to `http://localhost:5000/api/v1` when the var is
> missing — but pointing at a deployed backend later will silently keep
> hitting localhost unless this is corrected.

## Structure

```
src/
  api/
    axiosClient.js         # the ONLY file with baseURL + JWT header + error unwrapping
    auth.api.js               # auth + profile + ratings calls
    listings.api.js             # listings, categories, favorites, reports, notifications
    conversations.api.js          # conversations + messages
    cart.api.js                     # cart add/remove/list
    orders.api.js                     # checkout, order verification, order history
    assistant.api.js                    # page assistant "/ask" calls
    support.api.js                        # Contact Support form submission
  components/
    common/                 # Button, Input/Textarea/Select, Modal, Spinner,
                               # InfoPage (shared shell for Help/About pages),
                               # RoleBasedUI, ScrollToTop
    layout/                 # Navbar (incl. mobile hamburger menu), Footer,
                               # Sidebar, CategoryNav, NotificationBell
    listings/                # ListingCard, ListingGrid, FilterBar
    assistant/                # AssistantWidget (floating chat, calls assistant.api.js)
  pages/
    Home/                     # buyer: browse/search/filter
    Listings/                  # buyer: full listings grid (used by search/category)
    Category/                   # buyer: category-scoped browse
    ListingDetail/                # buyer: view, contact, call, favorite, report, buy now
    CreateListing/                  # seller: post + edit (ListingForm.jsx shared here,
                                       # includes multi-photo picker + upload)
    Chat/                             # both: inbox + thread
    Cart/                               # buyer: cart before checkout
    Orders/                              # both: order history + post-checkout confirmation
    Favorites/                             # buyer: saved listings
    Notifications/                           # both: notification feed
    Profile/                                   # both: own profile, public seller profile
                                                  # (incl. Fayda verify), my listings
    Auth/                                        # Login, Register
    Help/                                          # Help Center, How to Buy/Sell,
                                                       # Payment Safety, Contact Support, Safety Center
    About/                                          # About Us, Our Mission, Terms, Privacy
  hooks/
    useAuth.js                # accessor over AuthContext
    useListings.js              # search/filter/pagination state for Home
    useDebounce.js                # delays the search input's API call
    useLanguage.js                  # accessor over LanguageContext
    useTheme.js                       # accessor over ThemeContext
    usePageContext.js                   # page-level context used by AssistantWidget
  context/
    AuthContext.jsx           # auth state + localStorage persistence
    LanguageContext.jsx         # active language + t() translator (see utils/translations.js)
    ThemeContext.jsx              # light/dark (or brand) theme state
  routes/
    AppRouter.jsx              # all route definitions in one place
    ProtectedRoute.jsx           # auth + optional role gate for a route
  styles/globals.css           # tailwind + the hang-tag card motif
  utils/
    formatters.js / format.js     # price/condition/date formatting
    translations.js                 # string tables consumed by useLanguage/t()
    categoryIcons.jsx                 # icon-per-category mapping
    heroThemes.js                       # per-category hero banner theming
    notificationText.js                   # maps notification types → display copy
    constants.js                            # shared enums/constants
    mockListings.js                           # local fixture data (dev/demo use only)
```

## Why axios + interceptors instead of raw fetch

`axiosClient.js` is the only file that knows the base URL, attaches the
JWT, and unwraps the backend's `{ success, data }` envelope. Every other
`*.api.js` file just calls `axiosClient.get/post/...` and gets back the
actual payload directly — no repeated `res.data.data`, no repeated
auth-header logic. A 401 response anywhere in the app clears the stale
session automatically via a `vintech:unauthorized` event that
`AuthContext` listens for, so an expired token can't leave the UI
thinking the user is still logged in.

## Why `useListings` and `useDebounce` are separate hooks

`useListings` owns all filter/pagination state and the actual fetch —
`Home/index.jsx` just renders what it returns. `useDebounce` is generic
(not listings-specific) so the search input doesn't fire an API call on
every keystroke, only once typing pauses. Kept as its own hook rather
than inlined into `useListings` because it's reusable anywhere else a
debounced input shows up later.

## Language and theme are app-wide context, not page state

`LanguageProvider` and `ThemeProvider` wrap the whole app in `main.jsx`
(outside `AuthProvider`), so `useLanguage()`'s `t()` translator and
`useTheme()` are available in every component without prop-drilling, and
both survive independently of whether the user is logged in.

## Buyer vs seller — one app, not two

Every user can both buy and sell, so this is one app with role-aware
routes:
- Public: `/`, `/listings`, `/listings/:id`, `/category/:slug`,
  `/users/:id`, `/login`, `/register`, plus the marketing/help pages
  (`/help*`, `/safety`, `/about`, `/mission`, `/terms`, `/privacy`)
- Seller (requires login + `role: seller`): `/sell`, `/listings/:id/edit`,
  `/my-listings`
- Shared (requires login, any role): `/profile`, `/favorites`,
  `/notifications`, `/cart`, `/orders`, `/orders/complete`, `/messages`,
  `/messages/:id`

## Known gaps / next steps

- **Rating submission has no UI.** `PublicProfile` fetches and displays
  a seller's existing ratings, but there's no form to submit one — it
  would naturally live on `ListingDetail` or `Orders` after a completed
  transaction, calling the backend's already-working `POST /ratings`.
- **The footer's "Telegram" link is a static social icon, not a
  per-seller contact channel.** There's no `telegram` column on `users`
  in the backend schema, so there's nothing to wire a per-listing
  Telegram button to yet. The **Call** button, by contrast, is fully
  wired — it hits `GET /listings/:id/seller-phone` and redirects to
  `tel:`.
- **`mockListings.js` is local fixture data**, not currently imported
  by any page as far as this pass found — worth confirming it isn't
  dead code before shipping, or removing it if so.
- **One leftover "vintech" name survives in the code itself**, not just
  docs: the 401-handling custom event is named `'vintech:unauthorized'`
  (`src/api/axiosClient.js` dispatches it, `src/context/AuthContext.jsx`
  listens for it). Purely cosmetic — nothing breaks if you leave it —
  but rename both occurrences to something like
  `'regebeya:unauthorized'` if you want the rebrand to be complete
  end-to-end.