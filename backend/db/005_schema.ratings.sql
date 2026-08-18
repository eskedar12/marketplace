-- Ratings table
--
-- Assumes `users` and `listings` already exist with uuid primary keys
-- (matches the rest of the codebase — see the `uuid` references in
-- listings.validation.js and listings.repository.js). If your project
-- keeps a master schema.sql, fold this in there; otherwise just run
-- this file directly against your database:
--
--   psql "$DATABASE_URL" -f db/schema.ratings.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS ratings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id     uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  score          smallint NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment        text,
  created_at     timestamptz NOT NULL DEFAULT now(),

  -- Buyers can't rate themselves, and can only leave one review per
  -- seller per listing (matches the "not yourself" check already in
  -- ratings.service.js, plus a guard against duplicate-spamming a review).
  CONSTRAINT ratings_no_self_rating CHECK (rater_id <> rated_user_id),
  CONSTRAINT ratings_unique_per_listing UNIQUE (rater_id, rated_user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_listing_id ON ratings(listing_id);

-- Keep users.rating_avg / users.rating_count in sync.
--
-- users.repository.js reads these two columns directly on every profile
-- fetch, but nothing in the app currently writes to them — ratings.service.js
-- only inserts into `ratings` and computes an average on demand for the
-- reviews list. Without this trigger, a new review would never show up in
-- Profile/PublicProfile's "X ★ (Y reviews)" line. This recalculates from
-- `ratings` on every insert/update/delete so the two stay consistent no
-- matter what touches the table.
CREATE OR REPLACE FUNCTION refresh_user_rating_stats() RETURNS trigger AS $$
DECLARE
  target_user uuid := COALESCE(NEW.rated_user_id, OLD.rated_user_id);
BEGIN
  UPDATE users u
  SET rating_avg = COALESCE(s.avg_score, 0),
      rating_count = COALESCE(s.total, 0)
  FROM (
    SELECT ROUND(AVG(score)::numeric, 2) AS avg_score, COUNT(*) AS total
    FROM ratings
    WHERE rated_user_id = target_user
  ) s
  WHERE u.id = target_user;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ratings_refresh_stats ON ratings;
CREATE TRIGGER trg_ratings_refresh_stats
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION refresh_user_rating_stats();
