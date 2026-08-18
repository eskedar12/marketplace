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
  // files: an array of File objects from an <input type="file" multiple">.
  // Returns { urls: string[] } — feed straight into listingsApi.create's
  // `images` field.
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return axiosClient.post('/listings/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const categoriesApi = {
  getAll: () => axiosClient.get('/categories'),
  // Powers the category browse page — returns the category, its
  // parent (for a breadcrumb), its subcategories (for pill filters),
  // and categoryIds (this category + all its subcategory ids) to
  // pass straight into listingsApi.search({ category_id: ... }).
  getBySlug: (slug) => axiosClient.get(`/categories/${slug}`),
};

export const favoritesApi = {
  add: (listingId) => axiosClient.post(`/favorites/${listingId}`),
  remove: (listingId) => axiosClient.delete(`/favorites/${listingId}`),
  getMine: () => axiosClient.get('/favorites'),
};

export const reportsApi = {
  create: (listingId, reason) => axiosClient.post('/reports', { listing_id: listingId, reason }),
};