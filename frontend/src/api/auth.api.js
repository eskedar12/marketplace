import axiosClient from './axiosClient.js';

export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
};

// Profile calls live here too rather than a separate users.api.js —
// small enough surface (me / update me / public profile) that a
// dedicated file would be mostly empty.
export const usersApi = {
  getMe: () => axiosClient.get('/users/me'),
  updateMe: (payload) => axiosClient.patch('/users/me', payload),
  getById: (id) => axiosClient.get(`/users/${id}`),
};

export const ratingsApi = {
  getForUser: (userId) => axiosClient.get(`/ratings/user/${userId}`),
  create: (payload) => axiosClient.post('/ratings', payload),
};
