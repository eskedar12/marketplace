-- =========================================================
-- VinTech Marketplace — Add "allow buyers to call me" setting
-- File: 006_add_allow_calls_to_users.sql
-- Run this AFTER 001_schema.sql.
-- =========================================================
--
-- Defaults to TRUE so existing sellers keep getting call requests
-- unless they explicitly opt out from their profile settings.
-- The seller's phone number itself already lives on users.phone —
-- this is just the visibility switch for it.

ALTER TABLE users
  ADD COLUMN allow_calls BOOLEAN NOT NULL DEFAULT TRUE;
