-- =========================================================
-- VinTech Marketplace — Add Fayda (Ethiopian national ID) verification
-- File: 011_fayda_verification.sql
-- Run this AFTER 001_schema.sql.
-- =========================================================
--
-- fayda_sub: the subject claim from Fayda's id_token — a stable,
-- unique identifier for the verified person. UNIQUE so one Fayda
-- identity can't be linked to two different marketplace accounts.
-- Nullable because most users won't have gone through verification.
--
-- fayda_verified_at: when verification completed. Kept separate from
-- users.is_verified (already on the table) so is_verified stays the
-- single boolean the UI checks, while this gives an audit trail.
--
-- NOTE: this ships with MOCK verification wired up (see
-- src/modules/fayda) — no real Fayda credentials are required for
-- these columns or this flow to work end to end.

ALTER TABLE users
  ADD COLUMN fayda_sub VARCHAR(255) UNIQUE,
  ADD COLUMN fayda_verified_at TIMESTAMPTZ;
