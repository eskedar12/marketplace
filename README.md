# ReGebeya — Frontend

The client for **ReGebeya**, a peer-to-peer secondhand marketplace.
Buyers browse and favorite listings, message sellers, and rate them
after a transaction; sellers post and manage their own listings. Built
as a single-page app with **React, Vite, React Router, Tailwind CSS,
and Axios**.

---

## Tech stack

| Concern             | Library                    |
|----------------------|-----------------------------|
| UI                       | React 18                       |
| Build tool                | Vite                             |
| Routing                     | `react-router-dom`                 |
| HTTP client                  | `axios` (single shared instance)     |
| Styling                        | Tailwind CSS                          |
| Auth state                        | React Context (`AuthContext`)          |

There's no global state library (Redux/Zustand) — auth lives in
`AuthContext`, everything else is fetched per-page with local
component state and small custom hooks (`useListings`, `useDebounce`).

---

## Project structure

```
src/
├── App.jsx                    # Shell: Navbar + routed page + Footer
├── main.jsx                     # Entry point — mounts BrowserRouter + AuthProvider
├── routes/
│   └── AppRouter.jsx               # All <Route> definitions, public + protected
├── context/
│   └── AuthContext.jsx               # Current user, login/logout, session persistence
├── hooks/
│   ├── useAuth.js                       # Convenience hook over AuthContext
│   ├── useListings.js                     # Fetch/filter listings
│   └── useDebounce.js                       # Debounce for search inputs
├── api/
│   ├── axiosClient.js                          # Shared axios instance — baseURL, JWT
│   │                                             header, response unwrapping, 401 handling
│   ├── auth.api.js                               # register/login calls
│   ├── listings.api.js                             # listings + favorites calls
│   └── conversations.api.js                          # inbox/messages calls
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx        # Logo, category nav, role-based icon set
│   │   ├── Footer.jsx           # Category links, sourced from categoryIcons.jsx
│   │   ├── CategoryNav.jsx        # "Categories" dropdown in the navbar
│   │   └── Sidebar.jsx               # Filter sidebar on browse/category pages
│   ├── listings/
│   │   ├── ListingCard.jsx      # Single listing preview (used across the app)
│   │   ├── ListingGrid.jsx        # Grid layout of ListingCards
│   │   └── FilterBar.jsx             # Price/condition/location filters
│   └── common/
│       ├── Button.jsx, Input.jsx, Modal.jsx, Spinner.jsx
│       └── RoleBasedUI.jsx        # Small role-gated UI helper
├── pages/
│   ├── Home/index.jsx                  # Landing page: hero, categories, CTA banner
│   ├── Category/index.jsx                # Category browse page
│   ├── Listings/index.jsx                  # Full listings browse/search page
│   ├── ListingDetail/index.jsx               # Single listing detail page
│   ├── CreateListing/index.jsx                 # Post/edit an item ("Post an item" form)
│   ├── Favorites/Favorites.jsx                    # Buyer's saved listings
│   ├── Notifications/Notifications.jsx              # Notifications (UI shell — see note below)
│   ├── Profile/                                       # Own profile, public profile, "My Listings"
│   ├── Chat/                                             # Inbox + message thread
│   └── Auth/                                               # Login, Register (incl. role picker)
└── utils/
    ├── categoryIcons.jsx      # Source of truth for the 9 categories: name, slug, icon, colors
    ├── heroThemes.js             # Per-category hero headline + background image
    └── constants.js, formatters.js
```

---

## Getting started

### 1. Prerequisites

- Node.js 18+
- The backend API running (see the backend README) — or a deployed
  instance you can point at

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=http://localhost:5000/api/v1
```

If unset, it falls back to `http://localhost:5000/api/v1` (see
`src/api/axiosClient.js`).

### 4. Run the dev server

```bash
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`).

### 5. Build for production

```bash
npm run build
```

Output goes to `dist/`, ready to serve as static files.

---

## Auth & session handling

- On login/register, the JWT is stored in `localStorage` under
  `vintech_token`, and the user object under `vintech_user`.
- Every request through `axiosClient` automatically attaches
  `Authorization: Bearer <token>` if a token is present.
- A `401` response from anywhere clears both localStorage keys and
  fires a `vintech:unauthorized` window event, which `AuthContext`
  listens for to log the user out — so an expired token surfaces as a
  clean logout instead of silent failures.
- `<ProtectedRoute>` (`src/routes/ProtectedRoute.jsx`) wraps any route
  that requires a logged-in user (Favorites, Notifications, Profile,
  Create Listing, Chat).

## Role-based navigation

Registration now includes a **buyer / seller** toggle
(`pages/Auth/Register.jsx`), which the backend stores as `role`. The
Navbar reads `user.role` to decide what the right-hand icon set shows:

- **Buyer:** Favorites → Notifications → Profile
- **Seller:** My Listings → Notifications → Profile

This only affects what's *shown* — it isn't a hard permission boundary
(nothing stops a buyer account from hitting `/sell` directly unless the
backend enforces it too).

---

## Known gaps / things not yet built

- **Notifications has no real data.** `pages/Notifications/Notifications.jsx`
  renders a static "you're all caught up" empty state — there's no
  backend notifications endpoint to fetch from yet.
- **No image upload UI.** `CreateListing` expects listing images as
  URLs; there's no file-picker → upload-to-storage flow wired up.
