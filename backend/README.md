# ReGebeya — Backend API

The REST API powering **ReGebeya**, a peer-to-peer marketplace where anyone
can buy or sell secondhand items — post listings, browse by category,
message sellers, favorite items, and leave ratings after a transaction.

Built with **Node.js, Express, and PostgreSQL**, structured as a
modular monolith: each domain (auth, listings, favorites, conversations,
ratings, reports, users, categories) is a self-contained module with its
own routes → controller → service → repository layers.

---

## Tech stack

| Concern              | Library              |
|-----------------------|-----------------------|
| HTTP server            | Express               |
| Database               | PostgreSQL (`pg`)     |
| Auth                    | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing |
| Validation              | `joi`                 |
| Security headers        | `helmet`               |
| CORS                     | `cors`                 |
| Request logging          | `morgan`                |
| Rate limiting             | `express-rate-limit`    |
| Env vars                   | `dotenv`                 |

No ORM — queries are hand-written SQL via the `pg` `Pool`, wrapped in a
thin `query()` helper (`src/config/db.js`) that logs any query slower
than 200ms.

---

## Project structure

```
src/
├── app.js                  # Express app: middleware + route mounting
├── server.js                # Entry point — starts the HTTP server
├── config/
│   ├── db.js                  # Postgres pool + query() wrapper
│   └── env.js                  # Loads & validates required env vars
├── middlewares/
│   ├── auth.middleware.js         # Verifies JWT, attaches req.user
│   ├── error.middleware.js         # Centralized error handler
│   ├── rateLimit.middleware.js      # apiLimiter + stricter authLimiter
│   └── validate.middleware.js        # Joi schema validation middleware
├── modules/
│   ├── auth/                # register, login
│   ├── users/                # profile CRUD
│   ├── categories/            # category tree
│   ├── listings/                # the core marketplace entity
│   ├── favorites/                # save-for-later join table
│   ├── conversations/              # buyer↔seller inbox
│   │   └── messages/                  # messages within a conversation
│   ├── ratings/                       # post-transaction ratings
│   └── reports/                        # flagging a listing
└── utils/
    ├── ApiError.js       # Typed HTTP errors (ApiError.notFound(), etc.)
    ├── asyncHandler.js    # Wraps async route handlers, forwards errors
    └── logger.js            # Console logger
```

Each module follows the same four-file pattern:

```
<name>.routes.js       → Express router, wires paths to controller methods
<name>.controller.js   → Parses req, calls service, shapes the response
<name>.service.js      → Business logic, orchestrates repositories
<name>.repository.js   → Raw SQL queries against Postgres
```

---

## Getting started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ (with the `pgcrypto` extension available)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/regebeya
JWT_SECRET=some-long-random-string
JWT_EXPIRES_IN=7d          # optional, defaults to 7d
PORT=5000                    # optional, defaults to 5000
NODE_ENV=development           # optional

RATE_LIMIT_WINDOW_MS=900000       # optional, defaults to 15 min
RATE_LIMIT_MAX=100                  # optional, defaults to 100 req/window
```

`DATABASE_URL` and `JWT_SECRET` are required — the app throws on boot if
either is missing (see `src/config/env.js`).

### 4. Set up the database

Run the migrations **in numeric order** against your Postgres database:

```bash
psql "$DATABASE_URL" -f migrations/001_schema.sql
psql "$DATABASE_URL" -f migrations/003_seed.sql        # or 002_seed.sql
psql "$DATABASE_URL" -f migrations/004_add_role_to_users.sql
```

- `001_schema.sql` creates every table, enum, index, and trigger.
- `002_seed.sql` / `003_seed.sql` are alternate seed data sets (003 uses
  the current flat 9-category structure — prefer this one).
- `004_add_role_to_users.sql` adds the `role` (`buyer` / `seller`) column
  that the auth/registration flow now requires. **Run this even on a
  fresh database** — it isn't yet folded into `001_schema.sql`.

Seeded users have placeholder (non-working) password hashes — either
register real accounts through the API, or generate a real hash with
`bcrypt.hashSync('password123', 10)` and `UPDATE` the seeded rows.

### 5. Run the server

```bash
node src/server.js
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

| Module          | Base path                  | Notes |
|-------------------|-----------------------------|-------|
| Auth               | `/api/v1/auth`                | `POST /register` (now requires `role`), `POST /login` |
| Users               | `/api/v1/users`                 | Profile read/update |
| Categories           | `/api/v1/categories`              | Flat list, self-referencing via `parent_id` |
| Listings              | `/api/v1/listings`                  | CRUD + browse/filter/search |
| Favorites               | `/api/v1/favorites`                   | Save/unsave, list your favorites |
| Conversations             | `/api/v1/conversations`                | One thread per buyer per listing |
| Messages                    | nested under conversations               | Send/read messages in a thread |
| Ratings                       | `/api/v1/ratings`                          | One rating per person per listing |
| Reports                         | `/api/v1/reports`                            | Flag a listing for review |

Authenticated routes expect `Authorization: Bearer <jwt>`, issued by
`/auth/login` or `/auth/register`.

---

## The `role` field

Every user has a `role` of either `buyer` or `seller`, chosen at
registration (see `migrations/004_add_role_to_users.sql`). This drives
the frontend's role-specific navigation (a seller sees "My Listings"
where a buyer sees "Favorites"), but note: **it does not currently gate
any backend permissions** — a `buyer` account can still hit the listings
endpoints and post an item. If you want role to actually restrict what
an account can do server-side, that check needs to be added to
`listings.service.js` / `auth.middleware.js` — right now it's UI-only.

---

## Known gaps / things not yet built

- **No notifications module.** The frontend has a `/notifications` page,
  but there's no backing table, service, or routes for it yet — it
  currently renders a static empty state.
- **No image upload handling.** `listing_images.image_url` expects a
  URL string; there's no endpoint for actually uploading a file to
  storage (S3, Cloudinary, etc.) — that would need to be added.
- **No admin/moderation role.** `reports` has a `status` workflow
  (pending/reviewed/dismissed) but there's no endpoint restricted to
  admins for actioning it — see the comment in
  `src/modules/reports/reports.routes.js`.
- **CORS is wide open** (`app.use(cors())` with no origin restriction) —
  tighten this to your actual frontend origin before deploying.