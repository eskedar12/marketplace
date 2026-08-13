const favoritesRepository = require('./favorites.repository');

async function addFavorite(userId, listingId) {
  return favoritesRepository.add(userId, listingId);
}

async function removeFavorite(userId, listingId) {
  return favoritesRepository.remove(userId, listingId);
}

async function getFavorites(userId) {
  return favoritesRepository.listByUser(userId);
}

module.exports = { addFavorite, removeFavorite, getFavorites };
