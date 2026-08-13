# Zego — Marketplace Frontend

React + Vite + Tailwind + Axios frontend for the VinTech Challenge
marketplace. One app, role-aware routes for both buyer and seller.

## Setup

```bash
npm install
cp .env.example .env
# edit .env — VITE_API_URL should point at your backend
npm run dev
```

Runs on http://localhost:5173. Your backend must be running and its
`cors()` config must allow this origin.

## Structure

```
src/
  api/
    axiosClient.js        # the ONLY file with baseURL + JWT header + error unwrapping
    auth.api.js             # auth + profile + ratings calls
    listings.api.js          # listings, categories, favorites, reports
    conversations.api.js      # conversations + messages
  components/
    common/                 # Button, Input/Textarea/Select, Modal, Spinner
    layout/                 # Navbar, Footer, Sidebar
    listings/                # ListingCard, ListingGrid, FilterBar
  pages/
    Home/                    # buyer: browse/search/filter
    ListingDetail/            # buyer: view, contact, favorite, report
    CreateListing/             # seller: post + edit (ListingForm shared here)
    Chat/                     # both: inbox + thread
    Profile/                  # both: own profile, public seller profile, my listings
    Auth/                     # Login, Register
  hooks/
    useAuth.js                # accessor over AuthContext
    useListings.js             # search/filter/pagination state for Home
    useDebounce.js              # delays the search input's API call
  context/AuthContext.jsx     # the actual auth state + localStorage persistence
  routes/AppRouter.jsx         # all route definitions in one place
  styles/globals.css           # tailwind + the hang-tag card motif
  utils/formatters.js           # price/condition/date formatting
```

## Why axios + interceptors instead of raw fetch

`axiosClient.js` is the only file that knows the base URL, attaches
the JWT, and unwraps the backend's `{ success, data }` envelope. Every
other `*.api.js` file just calls `axiosClient.get/post/...` and gets
back the actual payload directly — no repeated `res.data.data`, no
repeated auth-header logic. A 401 response anywhere in the app clears
the stale session automatically via a `vintech:unauthorized` event
that `AuthContext` listens for, so an expired token can't leave the UI
thinking the user is still logged in.

## Why `useListings` and `useDebounce` are separate hooks

`useListings` owns all filter/pagination state and the actual fetch —
`Home/index.jsx` just renders what it returns. `useDebounce` is
generic (not listings-specific) so the search input doesn't fire an
API call on every keystroke, only once typing pauses. Kept as its own
hook rather than inlined into `useListings` because it's reusable
anywhere else a debounced input shows up later.

## Buyer vs seller — one app, not two

Every user can both buy and sell, so this is one app with role-aware
routes:
- Public/buyer: `/`, `/listings/:id`, `/users/:id`
- Seller (requires login): `/sell`, `/listings/:id/edit`, `/my-listings`
- Shared (requires login): `/messages`, `/messages/:id`, `/profile`

## Known gaps / next steps

- **Image upload isn't built yet** — `ListingForm` has no file input;
  needs a backend endpoint + object storage (Cloudinary/S3) first.
- **`seller_phone` / a Telegram handle aren't returned by
  `GET /listings/:id` yet** — the backend's `findById` query doesn't
  join `users`, and there's no telegram column in the schema. The
  "Call"/"Telegram" buttons simply won't render until that's added;
  the in-app "Message on Zego" button already works since it uses the
  conversations API.
- **Posting a rating has no UI yet** — `PublicProfile` displays
  existing ratings, but there's no form to submit one (it would
  naturally live on `ListingDetail` after a completed transaction).
