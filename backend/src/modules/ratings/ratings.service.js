const ApiError = require('../../utils/ApiError');
const ratingsRepository = require('./ratings.repository');
const usersRepository = require('../users/users.repository');

async function rateUser(raterId, { rated_user_id, listing_id, score, comment }) {
  if (raterId === rated_user_id) {
    throw ApiError.badRequest('You cannot rate yourself');
  }

  const ratedUser = await usersRepository.findById(rated_user_id);
  if (!ratedUser) throw ApiError.notFound('User not found');
  if (ratedUser.role !== 'seller') {
    throw ApiError.badRequest('Only sellers can be rated');
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
