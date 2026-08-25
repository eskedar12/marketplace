const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { generateSitemap } = require('./sitemap.service');

const router = express.Router();

router.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const xml = await generateSitemap();
  res.set('Content-Type', 'application/xml');
  res.send(xml);
}));

module.exports = router;
