import axiosClient from './axiosClient.js';

export const ordersApi = {
  // listingIds: array of listing ids to buy in one checkout (a single id
  // for "Buy Now", several for checking out the cart).
  checkout: (listingIds) => axiosClient.post('/orders/checkout', { listing_ids: listingIds }),
  verify: (txRef) => axiosClient.get(`/orders/verify/${txRef}`),
  getMine: () => axiosClient.get('/orders/mine'),
  getSelling: () => axiosClient.get('/orders/selling'),
};
