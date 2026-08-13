const ApiError = require('../../utils/ApiError');
const ratingsRepository = require('./ratings.repository');

async function rateUser(raterId, { rated_user_id, listing_id, score, comment }) {
  if (raterId === rated_user_id) {
    throw ApiError.badRequest('You cannot rate yourself');
  }
  return ratingsRepository.create({
    rater_id: raterId,
    rated_user_id,
    listing_id,
    score,
    comment,
  });
}

async function getRatingsForUser(userId) {
  const [ratings, summary] = await Promise.all([
    ratingsRepository.findByUser(userId),
    ratingsRepository.getAverageForUser(userId),
  ]);
  return { ratings, summary };
}

module.exports = { rateUser, getRatingsForUser };
