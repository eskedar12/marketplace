const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const usersRepository = require('../users/users.repository');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

async function register({ name, email, password, phone, city, neighborhood }) {
  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await usersRepository.createUser({
    name,
    email,
    password_hash,
    phone,
    city,
    neighborhood,
  });

  const token = signToken(user);
  return { user, token };
}

async function login({ email, password }) {
  const user = await usersRepository.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(user);
  delete user.password_hash; // never send the hash back to the client
  return { user, token };
}

module.exports = { register, login };
