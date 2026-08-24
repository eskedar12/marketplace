import axiosClient from './axiosClient.js';

export const supportApi = {
  contact: (payload) => axiosClient.post('/support/contact', payload),
};
