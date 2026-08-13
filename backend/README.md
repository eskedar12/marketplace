# VinTech Marketplace — Backend API

Backend API for a peer-to-peer used-goods marketplace built for the
VinTech Challenge (Round 1). Node.js + Express + PostgreSQL.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js + Express | Fast to build REST APIs with, huge ecosystem |
| Database | PostgreSQL | Relational data (users → listings → images → conversations) with heavy filter/JOIN queries — see schema notes below |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless auth, no server-side session store needed |
| Validation | Joi | Rejects bad input before it ever reaches business logic |
| Security | Helmet, CORS, express-rate-limit | Baseline hardening — see "Security" section |

## Project structure

```
src/
  app.js                  # Express app: middleware + route wiring (no server start)
  server.js                # Actually starts the HTTP server
  config/
    env.js                  # Loads & validates environment variables
    db.js                   # Postgres connection pool
  middlewares/
    auth.middleware.js       # JWT verification (requireAuth / optionalAuth)
    validate.middleware.js   # Runs Joi schemas against requests
    rateLimit.middleware.js  # Rate limiting (general + strict auth limiter)
    error.middleware.js      # Centralized error → JSON response formatter
  modules/
    auth/                    # register, login
    users/                   # profile read/update
    categories/               # category tree
    listings/                # listing CRUD, search/filter
    favorites/                # save/unsave listings
    conversations/            # message threads
      messages/                 # messages within a conversation
    ratings/                  # post-transaction ratings
    reports/                  # flag a listing
  utils/
    ApiError.js               # Standard error shape for the whole app
    asyncHandler.js           # Wraps async routes so errors reach error.middleware.js
    logger.js                 # Minimal timestamped logger
db/
  001_schema.sql             # Table definitions, enums, indexes
  002_seed.sql                # Fake data for local testing
```

Each module under `modules/` follows the same four-file pattern:
**routes → controller → service → repository**.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally or hosted (Supabase/Railway/Neon all work)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your `.env` file**
   ```bash
   cp .env.example .env
   ```
   Then fill in your real `DATABASE_URL` and a random `JWT_SECRET`.
   Never commit `.env` — it's already in `.gitignore`.

3. **Create the database and run migrations**
   ```bash
   psql -U postgres -c "CREATE DATABASE vintech_marketplace;"
   psql "$DATABASE_URL" -f db/001_schema.sql
   psql "$DATABASE_URL" -f db/002_seed.sql   # optional — fake test data
   ```

4. **Run the server**
   ```bash
   npm run dev      # with auto-reload (nodemon)
   # or
   npm start         # plain node
   ```

5. **Verify it's alive**
   ```bash
   curl http://localhost:5000/health
   # { "success": true, "status": "ok" }
   ```

## API overview

All routes are prefixed with `/api/v1`.

| Module | Method + Path | Auth required | Purpose |
|---|---|---|---|
| Auth | `POST /auth/register` | No | Create account, returns JWT |
| Auth | `POST /auth/login` | No | Returns JWT |
| Listings | `GET /listings` | No | Search/filter/paginate listings |
| Listings | `GET /listings/:id` | No | Single listing detail |
| Listings | `GET /listings/me/mine` | Yes | Listings owned by the logged-in user |
| Listings | `POST /listings` | Yes | Create a listing |
| Listings | `PATCH /listings/:id` | Yes | Update a listing (owner only) |
| Listings | `DELETE /listings/:id` | Yes | Soft-remove a listing (status → `removed`) |
| Categories | `GET /categories` | No | Category tree |
| Favorites | see `favorites.routes.js` | Yes | Save/unsave listings |
| Conversations | see `conversations.routes.js` | Yes | List/create message threads |
| Messages | see `messages.routes.js` | Yes | Send/read messages within a thread |
| Ratings | see `ratings.routes.js` | Yes | Rate a seller after a transaction |
| Reports | see `reports.routes.js` | Yes | Flag a listing |

Every response follows the same envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "...", "details": [ ... ] }
```

## Security measures already in place

- Passwords hashed with bcrypt (10 salt rounds), never stored or returned in plaintext
- JWT-based auth, verified on every protected route via `requireAuth`
- Joi validation on all write endpoints — malformed input never reaches the database
- Parameterized SQL everywhere (no string-concatenated queries) — prevents SQL injection
- `express-rate-limit`: general API limit + a stricter limit on `/auth/*` to slow down brute-force/credential-stuffing attempts
- `helmet` sets standard security headers
- Listing deletes are **soft deletes** (status → `removed`), preserving history for any ratings/reports/conversations that reference that listing

## Testing

```bash
npm test
```

Uses Jest + Supertest. (Add test files under a `__tests__/` or
`*.test.js` pattern per module as you build them out.)

## Deployment notes

- Set `NODE_ENV=production` on your host
- Point `DATABASE_URL` at your production Postgres instance
- Tighten `cors()` in `app.js` to your actual frontend origin before going live — it's currently open for local development