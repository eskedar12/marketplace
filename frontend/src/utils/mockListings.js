// Deterministic mock-data generator for category browsing on the
// Home page. Each category gets its own pool of realistic item
// templates; we then "stretch" that pool out into a long, stable
// list (PAGE_SIZE * MAX_PAGES items) so that scrolling through a
// category always looks endless without ever changing between
// re-renders (same seed -> same list -> same images/prices).

export const PAGE_SIZE = 12;
export const MAX_PAGES = 9;

export const CITIES = [
  'Addis Ababa',
  'Adama',
  'Hawassa',
  'Bahir Dar',
  'Dire Dawa',
  'Mekelle',
  'Gondar',
  'Dessie',
  'Jimma',
];

const CONDITIONS = ['brand_new', 'lightly_used', 'fair_condition'];

// title | price range (ETB) | image keyword (used by the placeholder
// photo service so pictures at least roughly match the item)
const CATEGORY_TEMPLATES = {
  electronics: [
    { title: 'iPhone 13', priceMin: 20000, priceMax: 32000, keyword: 'iphone' },
    { title: 'Samsung Galaxy S22', priceMin: 18000, priceMax: 28000, keyword: 'samsung,phone' },
    { title: 'MacBook Pro 13"', priceMin: 55000, priceMax: 85000, keyword: 'macbook' },
    { title: 'Lenovo Laptop', priceMin: 28000, priceMax: 45000, keyword: 'laptop' },
    { title: 'iPad Air', priceMin: 22000, priceMax: 34000, keyword: 'ipad,tablet' },
    { title: 'Sony Headphones', priceMin: 3500, priceMax: 8000, keyword: 'headphones' },
    { title: 'PlayStation 5', priceMin: 45000, priceMax: 60000, keyword: 'playstation' },
    { title: 'Canon Camera', priceMin: 15000, priceMax: 32000, keyword: 'camera' },
    { title: '43" Smart TV', priceMin: 18000, priceMax: 30000, keyword: 'television' },
    { title: 'Dell Monitor', priceMin: 7000, priceMax: 14000, keyword: 'monitor' },
    { title: 'Bluetooth Speaker', priceMin: 1800, priceMax: 5500, keyword: 'speaker' },
    { title: 'Gaming Mouse & Keyboard', priceMin: 1200, priceMax: 3500, keyword: 'keyboard' },
  ],
  furniture: [
    { title: 'Modern Sofa', priceMin: 8000, priceMax: 22000, keyword: 'sofa' },
    { title: 'Wooden Dining Table', priceMin: 6000, priceMax: 18000, keyword: 'dining-table' },
    { title: 'Queen Bed Frame', priceMin: 7000, priceMax: 16000, keyword: 'bed-frame' },
    { title: 'Office Desk', priceMin: 3500, priceMax: 9000, keyword: 'desk' },
    { title: 'Bookshelf', priceMin: 2500, priceMax: 7000, keyword: 'bookshelf' },
    { title: 'Coffee Table', priceMin: 2000, priceMax: 6000, keyword: 'coffee-table' },
    { title: 'Recliner Chair', priceMin: 4500, priceMax: 12000, keyword: 'armchair' },
    { title: 'Wardrobe', priceMin: 6000, priceMax: 15000, keyword: 'wardrobe' },
    { title: 'TV Stand', priceMin: 2000, priceMax: 5500, keyword: 'tv-stand' },
    { title: 'Bunk Bed', priceMin: 8000, priceMax: 17000, keyword: 'bunk-bed' },
  ],
  apparel: [
    { title: 'Leather Jacket', priceMin: 1800, priceMax: 4500, keyword: 'leather-jacket' },
    { title: 'Running Shoes', priceMin: 1200, priceMax: 3800, keyword: 'sneakers' },
    { title: 'Denim Jeans', priceMin: 700, priceMax: 1800, keyword: 'jeans' },
    { title: 'Designer Handbag', priceMin: 2500, priceMax: 7000, keyword: 'handbag' },
    { title: 'Wool Coat', priceMin: 1500, priceMax: 4000, keyword: 'coat' },
    { title: 'Sneakers', priceMin: 1000, priceMax: 3200, keyword: 'shoes' },
    { title: 'Sunglasses', priceMin: 500, priceMax: 1800, keyword: 'sunglasses' },
    { title: 'Wrist Watch', priceMin: 1800, priceMax: 9000, keyword: 'wristwatch' },
    { title: 'Formal Suit', priceMin: 2500, priceMax: 6500, keyword: 'suit' },
    { title: 'Habesha Kemis', priceMin: 2000, priceMax: 6000, keyword: 'traditional-dress' },
  ],
  vehicles: [
    { title: 'Toyota Corolla', priceMin: 900000, priceMax: 1600000, keyword: 'toyota-corolla' },
    { title: 'Mountain Bicycle', priceMin: 5000, priceMax: 14000, keyword: 'mountain-bike' },
    { title: 'Bajaj Motorbike', priceMin: 60000, priceMax: 110000, keyword: 'motorbike' },
    { title: 'Toyota Vitz', priceMin: 700000, priceMax: 1200000, keyword: 'toyota-vitz,car' },
    { title: 'Hyundai Accent', priceMin: 850000, priceMax: 1400000, keyword: 'hyundai,car' },
    { title: 'Suzuki Swift', priceMin: 750000, priceMax: 1300000, keyword: 'suzuki,car' },
    { title: 'Electric Scooter', priceMin: 25000, priceMax: 55000, keyword: 'electric-scooter' },
    { title: 'Yamaha Motorcycle', priceMin: 90000, priceMax: 150000, keyword: 'motorcycle' },
    { title: 'Road Bicycle', priceMin: 6000, priceMax: 16000, keyword: 'road-bike' },
    { title: 'Toyota Land Cruiser', priceMin: 3500000, priceMax: 5200000, keyword: 'land-cruiser,suv' },
  ],
  'household-appliances': [
    { title: 'Refrigerator', priceMin: 15000, priceMax: 32000, keyword: 'refrigerator' },
    { title: 'Washing Machine', priceMin: 12000, priceMax: 26000, keyword: 'washing-machine' },
    { title: 'Microwave Oven', priceMin: 3000, priceMax: 8000, keyword: 'microwave' },
    { title: 'Air Conditioner', priceMin: 18000, priceMax: 35000, keyword: 'air-conditioner' },
    { title: 'Blender', priceMin: 900, priceMax: 2500, keyword: 'blender' },
    { title: 'Electric Stove', priceMin: 4000, priceMax: 10000, keyword: 'stove' },
    { title: 'Vacuum Cleaner', priceMin: 2500, priceMax: 7000, keyword: 'vacuum-cleaner' },
    { title: 'Water Dispenser', priceMin: 3500, priceMax: 8000, keyword: 'water-dispenser' },
    { title: 'Toaster', priceMin: 800, priceMax: 2000, keyword: 'toaster' },
    { title: 'Rice Cooker', priceMin: 1200, priceMax: 3000, keyword: 'rice-cooker' },
  ],
  books: [
    { title: 'Novel Collection', priceMin: 300, priceMax: 1200, keyword: 'novels' },
    { title: 'Textbook Set', priceMin: 500, priceMax: 2500, keyword: 'textbooks' },
    { title: "Children's Book Bundle", priceMin: 250, priceMax: 900, keyword: 'childrens-books' },
    { title: 'Cookbook', priceMin: 300, priceMax: 800, keyword: 'cookbook' },
    { title: 'Comic Book Set', priceMin: 400, priceMax: 1500, keyword: 'comic-books' },
    { title: 'Encyclopedia Set', priceMin: 1500, priceMax: 4000, keyword: 'encyclopedia' },
    { title: 'Notebook & Stationery Set', priceMin: 200, priceMax: 700, keyword: 'notebooks' },
    { title: 'Language Learning Books', priceMin: 400, priceMax: 1200, keyword: 'language-books' },
    { title: 'Study Guide Bundle', priceMin: 350, priceMax: 1000, keyword: 'study-guide' },
    { title: 'Bookshelf of Classics', priceMin: 800, priceMax: 2200, keyword: 'classic-books' },
  ],
  tools: [
    { title: 'Power Drill', priceMin: 1500, priceMax: 4000, keyword: 'power-drill' },
    { title: 'Tool Box Set', priceMin: 2000, priceMax: 6000, keyword: 'toolbox' },
    { title: 'Hammer & Nail Set', priceMin: 500, priceMax: 1500, keyword: 'hammer' },
    { title: 'Welding Machine', priceMin: 6000, priceMax: 15000, keyword: 'welding' },
    { title: 'Lawn Mower', priceMin: 8000, priceMax: 18000, keyword: 'lawn-mower' },
    { title: 'Aluminum Ladder', priceMin: 2500, priceMax: 6000, keyword: 'ladder' },
    { title: 'Wrench Set', priceMin: 800, priceMax: 2200, keyword: 'wrench' },
    { title: 'Generator', priceMin: 12000, priceMax: 28000, keyword: 'generator' },
    { title: 'Circular Saw', priceMin: 2500, priceMax: 6500, keyword: 'circular-saw' },
    { title: 'Angle Grinder', priceMin: 1500, priceMax: 4000, keyword: 'angle-grinder' },
  ],
  hobbies: [
    { title: 'Acoustic Guitar', priceMin: 3500, priceMax: 9000, keyword: 'acoustic-guitar' },
    { title: 'Chess Set', priceMin: 500, priceMax: 2500, keyword: 'chess' },
    { title: 'Football', priceMin: 400, priceMax: 1200, keyword: 'football' },
    { title: 'Basketball', priceMin: 500, priceMax: 1500, keyword: 'basketball' },
    { title: 'Painting Easel & Supplies', priceMin: 1500, priceMax: 4500, keyword: 'painting-easel' },
    { title: 'Camera Lens', priceMin: 4000, priceMax: 12000, keyword: 'camera-lens' },
    { title: 'Fishing Rod', priceMin: 800, priceMax: 2500, keyword: 'fishing-rod' },
    { title: 'Yoga Mat & Set', priceMin: 500, priceMax: 1500, keyword: 'yoga-mat' },
    { title: 'Drone', priceMin: 8000, priceMax: 22000, keyword: 'drone' },
    { title: 'Board Game Collection', priceMin: 600, priceMax: 2000, keyword: 'board-games' },
  ],
  office: [
    { title: 'Office Chair', priceMin: 2500, priceMax: 7000, keyword: 'office-chair' },
    { title: 'Filing Cabinet', priceMin: 2000, priceMax: 5500, keyword: 'filing-cabinet' },
    { title: 'Printer', priceMin: 4500, priceMax: 12000, keyword: 'printer' },
    { title: 'Standing Desk', priceMin: 6000, priceMax: 15000, keyword: 'standing-desk' },
    { title: 'Whiteboard', priceMin: 1200, priceMax: 3500, keyword: 'whiteboard' },
    { title: 'Projector', priceMin: 8000, priceMax: 20000, keyword: 'projector' },
    { title: 'Paper Shredder', priceMin: 1800, priceMax: 4500, keyword: 'paper-shredder' },
    { title: 'Office Supplies Bundle', priceMin: 700, priceMax: 2000, keyword: 'office-supplies' },
    { title: 'Conference Table', priceMin: 9000, priceMax: 22000, keyword: 'conference-table' },
    { title: 'Laptop Stand', priceMin: 500, priceMax: 1500, keyword: 'laptop-stand' },
  ],
  other: [
    { title: 'Miscellaneous Household Bundle', priceMin: 500, priceMax: 3000, keyword: 'household-items' },
    { title: 'Assorted Decor Pieces', priceMin: 400, priceMax: 2500, keyword: 'home-decor' },
    { title: 'Storage Boxes', priceMin: 300, priceMax: 1200, keyword: 'storage-boxes' },
  ],
};

// Small deterministic PRNG (mulberry32) so the "endless" list is
// stable across renders/pages — no flicker, no re-shuffling when
// React re-renders the component.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

const TOTAL_ITEMS = PAGE_SIZE * MAX_PAGES; // 108

// Generates a full, stable list of mock listings for a category.
// Cycles through that category's item templates, adding a "(2)",
// "(3)"... suffix once it wraps around so titles stay readable.
export function generateCategoryListings(categorySlug) {
  const templates = CATEGORY_TEMPLATES[categorySlug] || CATEGORY_TEMPLATES.other;
  const seedBase = hashString(categorySlug || 'other');
  const items = [];

  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const rng = mulberry32(seedBase + i * 97 + 1);
    const tpl = templates[i % templates.length];
    const variantNum = Math.floor(i / templates.length) + 1;
    const rawPrice = tpl.priceMin + rng() * (tpl.priceMax - tpl.priceMin);
    const price = Math.round(rawPrice / 50) * 50;
    const condition = CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
    const city = CITIES[Math.floor(rng() * CITIES.length)];
    const lock = Math.abs(seedBase + i * 13) % 10000;

    items.push({
      id: `mock-${categorySlug}-${i + 1}`,
      title: variantNum > 1 ? `${tpl.title} (${variantNum})` : tpl.title,
      price,
      condition,
      city,
      thumbnail_url: `https://loremflickr.com/600/600/${tpl.keyword}?lock=${lock}`,
      is_favorited: false,
      isMock: true,
    });
  }

  return items;
}
