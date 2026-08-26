-- =========================================================
-- ReGebeya — Backfill listing subcategories
-- File: 012_backfill_listing_subcategories.sql
-- Run this AFTER 008_add_subcategories.sql.
-- =========================================================
--
-- 003_seed.sql inserted its listings back when categories were flat,
-- so every seeded listing points straight at a parent category
-- (e.g. "Vehicles") instead of a leaf subcategory (e.g. "Cars").
-- 008_add_subcategories.sql only ADDED the new subcategory rows —
-- it never went back and reassigned existing listings — so those
-- seed listings silently failed to show up under any subcategory
-- pill on the frontend (they'd only ever match "All").
--
-- This migration re-points each affected seed listing at the most
-- sensible leaf subcategory. Safe to run multiple times: each UPDATE
-- is scoped to a specific listing id and only fires if that listing
-- is still sitting on the parent category.

-- Toyota Vitz 2015 -> Vehicles / Cars
UPDATE listings
SET category_id = (SELECT id FROM categories WHERE slug = 'cars')
WHERE id = '44444444-4444-4444-4444-444444444405'
  AND category_id = (SELECT id FROM categories WHERE slug = 'vehicles');

-- iPhone 13 Pro -> Electronics / Phones
UPDATE listings
SET category_id = (SELECT id FROM categories WHERE slug = 'phones')
WHERE id = '44444444-4444-4444-4444-444444444401'
  AND category_id = (SELECT id FROM categories WHERE slug = 'electronics');

-- Dell XPS 13 Laptop -> Electronics / Laptops and Computers
UPDATE listings
SET category_id = (SELECT id FROM categories WHERE slug = 'laptops-computers')
WHERE id = '44444444-4444-4444-4444-444444444402'
  AND category_id = (SELECT id FROM categories WHERE slug = 'electronics');

-- Leather 3-Seater Sofa -> Furniture & Home / Sofas
UPDATE listings
SET category_id = (SELECT id FROM categories WHERE slug = 'sofas')
WHERE id = '44444444-4444-4444-4444-444444444403'
  AND category_id = (SELECT id FROM categories WHERE slug = 'furniture');

-- Brand New Blender has no clean furniture subcategory match (no
-- "Kitchen" leaf exists yet) — left as-is on the parent deliberately;
-- add a "Kitchen" subcategory later if you want it to filter cleanly.

-- Men's Winter Jacket -> Fashion / Men's Clothing
UPDATE listings
SET category_id = (SELECT id FROM categories WHERE slug = 'mens-clothing')
WHERE id = '44444444-4444-4444-4444-444444444406'
  AND category_id = (SELECT id FROM categories WHERE slug = 'apparel');