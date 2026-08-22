const ApiError = require('../../utils/ApiError');
const ratingsRepository = require('./ratings.repository');
const usersRepository = require('../users/users.repository');
const listingsRepository = require('../listings/listings.repository');
const notificationsService = require('../notifications/notifications.service');

async function rateUser(raterId, { rated_user_id, listing_id, score, comment }) {
  if (raterId === rated_user_id) {
    throw ApiError.badRequest('You cannot rate yourself');
  }

  const ratedUser = await usersRepository.findById(rated_user_id);
  if (!ratedUser) throw ApiError.notFound('User not found');
  if (ratedUser.role !== 'seller') {
    throw ApiError.badRequest('Only sellers can be rated');
  }

  const rating = await ratingsRepository.create({
    rater_id: raterId,
    rated_user_id,
    listing_id,
    score,
    comment,
  });

  const [rater, listing] = await Promise.all([
    usersRepository.findById(raterId),
    listingsRepository.findById(listing_id),
  ]);
  await notificationsService.notify(rated_user_id, 'rating_received', {
    raterName: rater?.name,
    score,
    listingId: listing_id,
    listingTitle: listing?.title,
  });

  return rating;
}

async function getRatingsForUser(userId) {
  const [ratings, summary] = await Promise.all([
    ratingsRepository.findByUser(userId),
    ratingsRepository.getAverageForUser(userId),
  ]);
  return { ratings, summary };
}

module.exports = { rateUser, getRatingsForUser };
