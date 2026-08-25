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
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Returns { authorizeUrl } — the caller must do a full-page navigation
// (window.location.href = authorizeUrl), not just use the response.
// This has to leave the SPA the same way a real Fayda login would.
export const faydaApi = {
  connect: () => axiosClient.get('/fayda/connect'),
};

export const ratingsApi = {
  getForUser: (userId) => axiosClient.get(`/ratings/user/${userId}`),
  create: (payload) => axiosClient.post('/ratings', payload),
};
