-- =========================================================
-- VinTech Marketplace — Add buyer/seller role to users
-- File: 004_add_role_to_users.sql
-- Run this AFTER 001_schema.sql (and your seed file, if already run).
-- =========================================================

ALTER TABLE users
  ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'buyer'
  CHECK (role IN ('buyer', 'seller'));

-- Drop the default after backfilling existing rows if you want new
-- inserts to be forced to specify a role explicitly (the app already
-- always sends one, so this is optional):
-- ALTER TABLE users ALTER COLUMN role DROP DEFAULT;