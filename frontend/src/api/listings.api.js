import axiosClient from './axiosClient.js';

export const listingsApi = {
  search: (params) => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    );
    return axiosClient.get('/listings', { params: cleaned });
  },
  getOne: (id) => axiosClient.get(`/listings/${id}`),
  getMine: () => axiosClient.get('/listings/me/mine'),
  create: (payload) => axiosClient.post('/listings', payload),
  update: (id, payload) => axiosClient.patch(`/listings/${id}`, payload),
  remove: (id) => axiosClient.delete(`/listings/${id}`),
};

export const categoriesApi = {
  getAll: () => axiosClient.get('/categories'),
};

export const favoritesApi = {
  add: (listingId) => axiosClient.post(`/favorites/${listingId}`),
  remove: (listingId) => axiosClient.delete(`/favorites/${listingId}`),
  getMine: () => axiosClient.get('/favorites'),
};

export const reportsApi = {
  create: (listingId, reason) => axiosClient.post('/reports', { listing_id: listingId, reason }),
};
