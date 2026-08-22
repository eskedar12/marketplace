import axiosClient from './axiosClient.js';

export const conversationsApi = {
  getAll: () => axiosClient.get('/conversations'),
  getOne: (id) => axiosClient.get(`/conversations/${id}`),
  getOrCreate: (listingId) => axiosClient.post('/conversations', { listing_id: listingId }),
  getMessages: (conversationId) => axiosClient.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, content) =>
    axiosClient.post(`/conversations/${conversationId}/messages`, { content }),
  // Total unread messages across every conversation — powers the badge
  // on the Messages nav icon, same shape as notificationsApi.getUnreadCount.
  getUnreadCount: () => axiosClient.get('/conversations/unread-count'),
};
