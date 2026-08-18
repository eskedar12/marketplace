import axiosClient from './axiosClient.js';

export const cartApi = {
  getMine: () => axiosClient.get('/cart'),
  add: (listingId) => axiosClient.post(`/cart/${listingId}`),
  remove: (listingId) => axiosClient.delete(`/cart/${listingId}`),
};
