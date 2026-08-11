-- =========================================================
-- VinTech Marketplace — Database Schema (PostgreSQL)
-- File: 001_schema.sql
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------
-- ENUM TYPES
-- Using real enums instead of plain text keeps invalid
-- values (e.g. a typo'd condition) impossible at the DB level.
-- ---------------------------------------------------------
CREATE TYPE listing_condition AS ENUM (
  'brand_new',
  'lightly_used',
  'fair_condition'
);

CREATE TYPE listing_status AS ENUM (
  'active',
  'sold',
  'removed'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewed',
  'dismissed'
);

-- ---------------------------------------------------------
-- USERS
-- Every person is both a potential buyer and seller —
-- one table, no separate "buyer"/"seller" entities.
-- ---------------------------------------------------------
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  phone           VARCHAR(20)  NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  neighborhood    VARCHAR(100),
  profile_image   VARCHAR(500),
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  rating_avg      DECIMAL(3,2) NOT NULL DEFAULT 0.00, -- e.g. 4.75
  rating_count    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(city);

-- ---------------------------------------------------------
-- CATEGORIES
-- Self-referencing so subcategories (Electronics -> Phones)
-- don't need a separate table.
-- ---------------------------------------------------------
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ---------------------------------------------------------
-- LISTINGS
-- The core entity. price is DECIMAL (never float) for exact
-- money math. condition/status are enums for reliable filtering.
-- ---------------------------------------------------------
CREATE TABLE listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id      UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title            VARCHAR(200) NOT NULL,
  description      TEXT NOT NULL,
  price            DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  condition        listing_condition NOT NULL,
  city             VARCHAR(100) NOT NULL,
  neighborhood     VARCHAR(100),
  status           listing_status NOT NULL DEFAULT 'active',
  view_count       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for the main browse/filter query:
-- WHERE category_id = ? AND status = 'active' ORDER BY price
CREATE INDEX idx_listings_category_status_price ON listings(category_id, status, price);
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_location ON listings(city, neighborhood);
CREATE INDEX idx_listings_created ON listings(created_at DESC);

-- Full-text search index for keyword search across title + description
ALTER TABLE listings ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector);

-- ---------------------------------------------------------
-- LISTING_IMAGES
-- One listing has many images — separate table, not a column.
-- ---------------------------------------------------------
CREATE TABLE listing_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url    VARCHAR(500) NOT NULL,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

-- ---------------------------------------------------------
-- FAVORITES
-- "Save for later" — simple join table between users and listings.
-- ---------------------------------------------------------
CREATE TABLE favorites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id) -- a user can't favorite the same listing twice
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ---------------------------------------------------------
-- CONVERSATIONS + MESSAGES
-- Split into two tables so a buyer's inbox is one cheap query
-- (SELECT * FROM conversations WHERE buyer_id = ?) instead of
-- scanning every message ever sent.
-- ---------------------------------------------------------
CREATE TABLE conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id) -- one thread per buyer per listing
);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);

CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at           TIMESTAMPTZ
);

-- For loading a thread in order: WHERE conversation_id = ? ORDER BY sent_at
CREATE INDEX idx_messages_conversation_sent ON messages(conversation_id, sent_at);

-- ---------------------------------------------------------
-- RATINGS
-- Tied to a specific listing_id so every rating is provably
-- linked to a real transaction, not a floating generic score.
-- ---------------------------------------------------------
CREATE TABLE ratings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rater_id, listing_id) -- one rating per person per transaction
);

CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);

-- ---------------------------------------------------------
-- REPORTS
-- Separate from ratings because reports need a review
-- workflow (pending/reviewed/dismissed), ratings don't.
-- ---------------------------------------------------------
CREATE TABLE reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id     UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reason         VARCHAR(255) NOT NULL,
  status         report_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);

-- ---------------------------------------------------------
-- TRIGGER: auto-update `updated_at` on row changes
-- Applied to users and listings, the two tables that get edited.
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
