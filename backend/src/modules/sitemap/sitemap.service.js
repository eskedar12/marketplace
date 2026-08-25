const repo = require('./sitemap.repository');
const env = require('../../config/env');

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Builds sitemap.xml on every request rather than caching, since listings
// change constantly (new posts, sold items) and this is a lightweight
// query. If traffic grows, wrap this in a short-lived (e.g. 10 min) cache.
async function generateSitemap() {
  const base = env.frontendUrl.replace(/\/$/, '');

  const staticPages = ['/', '/listings', '/about', '/help', '/safety'];
  const [listings, categories] = await Promise.all([
    repo.findActiveListings(),
    repo.findAllCategories(),
  ]);

  const entries = [
    ...staticPages.map((path) => urlEntry(`${base}${path}`, null, 'daily', path === '/' ? '1.0' : '0.6')),
    ...categories.map((c) => urlEntry(`${base}/category/${c.slug}`, null, 'daily', '0.7')),
    ...listings.map((l) => urlEntry(`${base}/listings/${l.id}`, l.updated_at, 'weekly', '0.8')),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
}

module.exports = { generateSitemap };
