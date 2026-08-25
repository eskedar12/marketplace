# ReGebeya Used Goods Marketplace — Backend API

The REST API powering **ReGebeya**, a peer-to-peer marketplace where anyone
can buy or sell secondhand items — post listings with photos, browse by
category, message sellers, favorite items, check out with Chapa, get
notified, ask the page assistant a question, and leave ratings after a
transaction.

Built with **Node.js, Express, and PostgreSQL**, structured as a modular
monolith: each domain is a self-contained module with its own
routes → controller → service → repository layers.

---

## Tech stack

| Concern              | Library                              |
|-----------------------|----------------------------------------|
| HTTP server             | Express                                 |
| Database                 | PostgreSQL (`pg`)                        |
| Auth                       | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing |
| Validation                   | `joi`                                      |
| Security headers               | `helmet`                                    |
| CORS                             | `cors` (origin allowlist, see below)          |
| Request logging                   | `morgan`                                       |
| Rate limiting                       | `express-rate-limit`                            |
| Image storage                         | `cloudinary` + `multer` + `multer-storage-cloudinary` |
| Payments                                | Chapa REST API, called directly via `fetch` (`src/utils/chapa.js`) |
| Page assistant                            | Gemini API, called directly via `fetch` (`src/modules/assistant`) |
| Transactional email                         | Resend REST API, called directly via `fetch` (`src/utils/mailer.js`) |
| Env vars                                      | `dotenv`                                         |

No ORM — queries are hand-written SQL via the `pg` `Pool`, wrapped in a thin
`query()` helper (`src/config/db.js`).

No SDKs for Chapa, Gemini, or Resend — each is a thin wrapper around their
HTTP API using Node 18's built-in `fetch`, so there's nothing extra to
install for those three.

---

## Project structure

```
src/
├── app.js                     # Express app: middleware + route mounting
├── server.js                   # Entry point — starts the HTTP server
├── config/
│   ├── db.js                      # Postgres pool + query() wrapper
│   ├── env.js                      # Loads & validates required env vars
│   ├── cloudinary.js                # Cloudinary SDK config
│   └── multer.js                     # Multer storage engines (listing photos, avatars)
├── middlewares/
│   ├── auth.middleware.js              # requireAuth / optionalAuth / requireRole
│   ├── error.middleware.js              # Centralized error handler
│   ├── rateLimit.middleware.js           # apiLimiter, authLimiter, assistantLimiter, supportLimiter
│   └── validate.middleware.js             # Joi schema validation middleware
├── modules/
│   ├── auth/                 # register, login
│   ├── users/                  # profile CRUD
│   ├── categories/               # category tree (parent/subcategory)
│   ├── listings/                   # core entity: CRUD, search/filter, image upload, seller-phone
│   ├── favorites/                     # save-for-later join table
│   ├── conversations/                    # buyer↔seller inbox
│   │   └── messages/                        # messages within a conversation
│   ├── cart/                                  # save-for-checkout items
│   ├── orders/                                   # Chapa checkout, webhook, order history
│   ├── notifications/                               # in-app notification feed + unread count
│   ├── ratings/                                        # post-transaction ratings
│   ├── reports/                                           # flagging a listing
│   ├── fayda/                                                # Ethiopian national ID verification (mock + real mode)
│   ├── assistant/                                               # Gemini-backed page assistant ("/ask")
│   ├── support/                                                    # Contact Support form → email via Resend
│   └── sitemap/                                                       # sitemap.xml generator — see "Known gaps"
└── utils/
    ├── ApiError.js       # Typed HTTP errors (ApiError.notFound(), etc.)
    ├── asyncHandler.js    # Wraps async route handlers, forwards errors
    ├── logger.js            # Console logger
    ├── chapa.js               # Chapa payment API wrapper
    └── mailer.js                # Resend email API wrapper
```

Most modules follow the same four-file pattern:

```
<name>.routes.js       → Express router, wires paths to controller methods
<name>.controller.js   → Parses req, calls service, shapes the response
<name>.service.js      → Business logic, orchestrates repositories
<name>.repository.js   → Raw SQL queries against Postgres
```

(`assistant` and `support` skip the repository layer — they don't touch
the database.)

---

## Getting started

### 1. Prerequisites

- Node.js 18+ (needed for built-in `fetch`)
- PostgreSQL 14+ (with the `pgcrypto` extension available)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Only `DATABASE_URL` and `JWT_SECRET` are required — the app throws on
boot if either is missing (`src/config/env.js`). Everything else is
optional and the relevant feature simply stays disabled (with a clear
error only if someone actually tries to use it) until you set it.

> **Heads up — `.env.example` is currently incomplete.** It only covers
> server/database/auth/rate-limit/Fayda vars. It's missing the
> Cloudinary, Chapa, Gemini assistant, and Resend vars below, which are
> genuinely read by the code (`src/config/env.js`,
> `src/config/cloudinary.js`). Add these to `.env.example` (and your own
> `.env`) or those four features will silently stay disabled:
>
> ```bash
> # Image uploads (Cloudinary dashboard)
> CLOUDINARY_CLOUD_NAME=
> CLOUDINARY_API_KEY=
> CLOUDINARY_API_SECRET=
>
> # Payments (dashboard.chapa.co, start with a CHASECK_TEST- key)
> CHAPA_SECRET_KEY=
>
> # Page assistant (free key, no card needed: aistudio.google.com/apikey)
> GEMINI_API_KEY=
> ASSISTANT_MODEL=gemini-3.6-flash
>
> # Contact Support emails (free key: resend.com/api-keys)
> RESEND_API_KEY=
> SUPPORT_INBOX_EMAIL=
> SUPPORT_FROM_EMAIL=onboarding@resend.dev
>
> # Used to build absolute links (Fayda callback, Chapa return URL, CORS allowlist)
> FRONTEND_URL=http://localhost:5173
> API_BASE_URL=http://localhost:5000
> ```
>
> Also: the shipped `.env.example` sets
> `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vintech_marketplace`
> — the database name is a leftover from the old project name. Rename it
> to `regebeya` (or whatever you actually create in step 4) so the
> example is copy-pasteable.

### 4. Set up the database

Run every migration in `db/`, in numeric order:

```bash
psql "$DATABASE_URL" -f db/001_schema.sql
psql "$DATABASE_URL" -f db/003_seed.sql
psql "$DATABASE_URL" -f db/004_add_role_to_users.sql
psql "$DATABASE_URL" -f db/005_schema.ratings.sql
psql "$DATABASE_URL" -f db/006_add_allow_calls_to_users.sql
psql "$DATABASE_URL" -f db/007_cart_and_orders.sql
psql "$DATABASE_URL" -f db/008_add_subcategories.sql
psql "$DATABASE_URL" -f db/009_notifications.sql
psql "$DATABASE_URL" -f db/010_listing_checkout_reservation.sql
psql "$DATABASE_URL" -f db/011_fayda_verification.sql
```

- `001_schema.sql` creates every core table, enum, index, and trigger.
- `003_seed.sql` seeds the current flat category structure (there is no
  `002_seed.sql` in this repo — numbering just isn't contiguous).
- `004`–`011` are additive migrations layered on afterward (role column,
  ratings, call-permission flag, cart/orders, subcategories,
  notifications, checkout reservations, Fayda verification). **Run all
  of them, even on a fresh database** — none are folded back into
  `001_schema.sql`.

Seeded users have placeholder (non-working) password hashes — either
register real accounts through the API, or generate a real hash with
`bcrypt.hashSync('password123', 10)` and `UPDATE` the seeded rows.

### 5. Run the server

```bash
npm run dev     # nodemon, auto-restarts on file changes — use this locally
npm start       # plain node — use this in production
```

The API starts on `http://localhost:5000` (or your configured `PORT`),
with all routes mounted under `/api/v1`. A health check is available at
`GET /health`.

---

## API overview

All responses follow one shape:

```json
// success
{ "success": true, "data": { ... } }

// failure
{ "success": false, "message": "...", "details": { ... } }
```

| Module          | Base path                    | Notes |
|-------------------|-------------------------------|-------|
| Auth                | `/api/v1/auth`                    | `POST /register` (requires `role`), `POST /login` |
| Users                 | `/api/v1/users`                      | Profile read/update |
| Categories               | `/api/v1/categories`                    | Tree via self-referencing `parent_id` |
| Listings                    | `/api/v1/listings`                        | CRUD + browse/filter/search + `/upload-images` + `/:id/seller-phone` |
| Favorites                      | `/api/v1/favorites`                          | Save/unsave, list your favorites |
| Conversations                     | `/api/v1/conversations`                         | One thread per buyer per listing |
| Messages                             | nested under conversations                          | Send/read messages in a thread |
| Cart                                     | `/api/v1/cart`                                         | Add/remove/list — all routes require login |
| Orders                                      | `/api/v1/orders`                                          | `/checkout` (Chapa), `/webhook` (Chapa callback, unauthenticated by necessity, re-verified server-side), `/verify/:txRef`, `/mine`, `/selling` |
| Notifications                                  | `/api/v1/notifications`                                       | Feed, unread count, mark read/all-read |
| Ratings                                            | `/api/v1/ratings`                                                | One rating per person per listing |
| Reports                                               | `/api/v1/reports`                                                   | Flag a listing for review |
| Fayda                                                    | `/api/v1/fayda`                                                        | `/connect` (start), mock login page (dev), callback |
| Assistant                                                    | `/api/v1/assistant`                                                        | `POST /ask` — works for anonymous visitors too |
| Support                                                          | `/api/v1/support`                                                             | `POST /contact` — public, emails via Resend |

Authenticated routes expect `Authorization: Bearer <jwt>`, issued by
`/auth/login` or `/auth/register`.

---

## The `role` field

Every user has a `role` of either `buyer` or `seller`, chosen at
registration (`db/004_add_role_to_users.sql`). This drives the frontend's
role-specific navigation (a seller sees "My Listings" where a buyer sees
"Favorites"), **and it is enforced server-side**: `requireRole('seller')`
gates `POST /listings`, `PATCH /listings/:id`, `DELETE /listings/:id`,
`POST /listings/upload-images`, and `GET /listings/me/mine` in
`listings.routes.js`. A `buyer` account cannot hit those endpoints.

---

## CORS

`app.js` restricts CORS to an explicit allowlist — `FRONTEND_URL` plus
the two common local dev ports (`localhost:5173`, `127.0.0.1:5173`) — via
a custom `origin` callback, rejecting anything else with an error. Set
`FRONTEND_URL` to your real deployed frontend origin before shipping.

---

## Known gaps / things not yet built

- **No admin/moderation role.** `reports` has a `status` workflow
  (pending/reviewed/dismissed), but `GET /reports` and
  `PATCH /reports/:id` are only gated by `requireAuth`, not an admin
  check — any logged-in user can currently review/dismiss reports. See
  the `NOTE` comment in `src/modules/reports/reports.routes.js`.
- **`sitemap` module is built but not wired up.** `sitemap.routes.js`
  defines `GET /sitemap.xml`, but it's never `require`'d or
  `app.use()`'d in `app.js`/`server.js` — hitting that path currently
  404s. Either mount it or remove the module.
- **Rating submission has no matching endpoint gap on the frontend
  side** — the API (`POST /ratings`) is complete and correct; see the
  frontend README for the missing UI piece.
- **`npm test` will fail with "no tests found."** `jest` and
  `supertest` are listed in `devDependencies` and a `test` script exists,
  but there are no `*.test.js`/`*.spec.js` files anywhere in the repo
  yet — the test tooling is scaffolded but unused.
- **`.env.example` is missing several real env vars** — see the
  callout in the setup section above (Cloudinary, Chapa, Gemini, Resend,
  FRONTEND_URL, API_BASE_URL) and the leftover `vintech_marketplace`
  database name in the sample `DATABASE_URL`.