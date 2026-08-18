-- =========================================================
-- VinTech Marketplace — Cart + Orders (Chapa checkout)
-- File: 007_cart_and_orders.sql
-- Run this AFTER 001_schema.sql.
-- =========================================================

CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'cancelled');

-- ---------------------------------------------------------
-- CART_ITEMS
-- What a buyer has queued up to check out. One row per
-- listing — these are used, one-off items, not stocked SKUs,
-- so there's no quantity column.
-- ---------------------------------------------------------
CREATE TABLE cart_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- ---------------------------------------------------------
-- ORDERS
-- One row per listing being purchased. `tx_ref` is the Chapa
-- transaction reference — a single checkout (from the cart, or
-- straight from "Buy Now") can cover several listings/sellers
-- at once, so several order rows can share the same tx_ref and
-- get marked paid/failed together once Chapa confirms payment.
-- `price` snapshots the listing's price at purchase time, so a
-- later price edit on the listing never changes a past order.
-- ---------------------------------------------------------
CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price         DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  status        order_status NOT NULL DEFAULT 'pending',
  tx_ref        VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_tx_ref ON orders(tx_ref);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at(); -- reuses the function from 001_schema.sql
