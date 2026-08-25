-- =========================================================
-- ReGebeya — Add subcategories
-- File: 008_add_subcategories.sql
-- Run this AFTER 001_schema.sql and 003_seed.sql.
-- =========================================================
--
-- FIX: 003_seed.sql seeded the 7th top-level category as
-- "Hobbies" / slug "hobbies", but the frontend's category grid
-- (src/utils/categoryIcons.jsx) expects "Jewelry" / slug
-- "jewelry". Renaming here so that category's page (and its
-- new subcategories below) actually resolve.
UPDATE categories
SET name = 'Jewelry', slug = 'jewelry'
WHERE slug = 'hobbies';

-- ---------------------------------------------------------
-- SUBCATEGORIES
-- One INSERT per parent, using a slug subquery instead of a
-- hardcoded UUID so this runs safely regardless of the ids
-- 003_seed.sql happened to generate.
-- ---------------------------------------------------------

-- Electronics
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Phones', 'phones', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Laptops and Computers', 'laptops-computers', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('TVs', 'tvs', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Cameras', 'cameras', (SELECT id FROM categories WHERE slug = 'electronics'));

-- Furniture & Home
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Sofas', 'sofas', (SELECT id FROM categories WHERE slug = 'furniture')),
  ('Beds', 'beds', (SELECT id FROM categories WHERE slug = 'furniture')),
  ('Tables and Chairs', 'tables-chairs', (SELECT id FROM categories WHERE slug = 'furniture')),
  ('Cabinets', 'cabinets', (SELECT id FROM categories WHERE slug = 'furniture')),
  ('Shelving', 'shelving', (SELECT id FROM categories WHERE slug = 'furniture'));

-- Fashion (dbSlug is "apparel")
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Men''s Clothing', 'mens-clothing', (SELECT id FROM categories WHERE slug = 'apparel')),
  ('Women''s Clothing', 'womens-clothing', (SELECT id FROM categories WHERE slug = 'apparel')),
  ('Shoes', 'shoes', (SELECT id FROM categories WHERE slug = 'apparel')),
  ('Bags', 'bags', (SELECT id FROM categories WHERE slug = 'apparel'));

-- Vehicles
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Cars', 'cars', (SELECT id FROM categories WHERE slug = 'vehicles')),
  ('Motorcycles', 'motorcycles', (SELECT id FROM categories WHERE slug = 'vehicles')),
  ('Bicycles', 'bicycles', (SELECT id FROM categories WHERE slug = 'vehicles')),
  ('Spare Parts and Accessories', 'spare-parts-accessories', (SELECT id FROM categories WHERE slug = 'vehicles')),
  ('Heavy Equipment', 'heavy-equipment-vehicles', (SELECT id FROM categories WHERE slug = 'vehicles'));

-- Books & Education (dbSlug is "books")
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Textbooks', 'textbooks', (SELECT id FROM categories WHERE slug = 'books')),
  ('Novels and Fiction', 'novels-fiction', (SELECT id FROM categories WHERE slug = 'books')),
  ('Children''s Books', 'childrens-books', (SELECT id FROM categories WHERE slug = 'books')),
  ('School Supplies', 'school-supplies', (SELECT id FROM categories WHERE slug = 'books')),
  ('Educational Equipment', 'educational-equipment', (SELECT id FROM categories WHERE slug = 'books'));

-- Tools & Equipment (dbSlug is "tools")
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Power Tools', 'power-tools', (SELECT id FROM categories WHERE slug = 'tools')),
  ('Hand Tools', 'hand-tools', (SELECT id FROM categories WHERE slug = 'tools')),
  ('Construction Equipment', 'construction-equipment', (SELECT id FROM categories WHERE slug = 'tools')),
  ('Gardening Tools', 'gardening-tools', (SELECT id FROM categories WHERE slug = 'tools')),
  ('Safety Gear', 'safety-gear', (SELECT id FROM categories WHERE slug = 'tools'));

-- Jewelry (renamed above from "Hobbies")
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Rings', 'rings', (SELECT id FROM categories WHERE slug = 'jewelry')),
  ('Necklaces', 'necklaces', (SELECT id FROM categories WHERE slug = 'jewelry')),
  ('Bracelets', 'bracelets', (SELECT id FROM categories WHERE slug = 'jewelry')),
  ('Earrings', 'earrings', (SELECT id FROM categories WHERE slug = 'jewelry')),
  ('Watches', 'watches', (SELECT id FROM categories WHERE slug = 'jewelry'));

-- Office & Business (dbSlug is "office")
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Office Furniture', 'office-furniture', (SELECT id FROM categories WHERE slug = 'office')),
  ('Printers', 'printers', (SELECT id FROM categories WHERE slug = 'office')),
  ('Monitors', 'monitors', (SELECT id FROM categories WHERE slug = 'office')),
  ('Stationery', 'stationery', (SELECT id FROM categories WHERE slug = 'office')),
  ('Business Equipment', 'business-equipment', (SELECT id FROM categories WHERE slug = 'office'));

-- Other
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Toys and Games', 'toys-games', (SELECT id FROM categories WHERE slug = 'other')),
  ('Sporting Goods', 'sporting-goods', (SELECT id FROM categories WHERE slug = 'other')),
  ('Musical Instruments', 'musical-instruments', (SELECT id FROM categories WHERE slug = 'other')),
  ('Pet Supplies', 'pet-supplies', (SELECT id FROM categories WHERE slug = 'other')),
  ('Collectibles', 'collectibles', (SELECT id FROM categories WHERE slug = 'other'));