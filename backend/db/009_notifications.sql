-- =========================================================
-- VinTech Marketplace — Notifications
-- File: 009_notifications.sql
-- Run this AFTER 001_schema.sql.
-- =========================================================
--
-- One row per notification event. `data` carries whatever the
-- frontend needs to render + translate the message for that specific
-- type (sender name, listing title, price, etc.) instead of storing
-- a pre-rendered English sentence — the frontend picks the right
-- translation string for notifications.type and fills in `data`.

CREATE TYPE notification_type AS ENUM (
  'new_message',
  'listing_sold',
  'rating_received',
  'price_drop'
);

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         notification_type NOT NULL,
  data         JSONB NOT NULL DEFAULT '{}',
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Powers "my notifications, newest first"
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
-- Powers the unread-count badge on the bell icon without scanning every row
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
