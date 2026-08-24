-- =========================================================
-- VinTech Marketplace — Checkout reservation
-- File: 010_listing_checkout_reservation.sql
-- Run this AFTER 007_cart_and_orders.sql.
--
-- Problem: checkout() used to check `listing.status = 'active'`
-- and then create pending orders, with nothing stopping a second
-- buyer from doing the same thing for the same listing before
-- either payment settles — the listing only flipped to 'sold'
-- once a payment was actually confirmed. Two buyers could both
-- reach Chapa and both pay.
--
-- Fix: a listing moves to 'pending_sale' the instant a checkout
-- reserves it (atomically, guarded by an UPDATE ... WHERE so a
-- concurrent checkout can't reserve the same row twice), and only
-- moves to 'sold' once payment is confirmed. `reserved_until` lets
-- an abandoned checkout self-heal — if the buyer never completes
-- payment and no webhook ever arrives, the reservation simply
-- expires and the listing becomes reservable again.
-- =========================================================

-- NOTE: ADD VALUE cannot be used later in the same transaction it
-- runs in (Postgres restriction) — run this file on its own, the
-- same way the other numbered migrations are run.
ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'pending_sale';

ALTER TABLE listings ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ;
