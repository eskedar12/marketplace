import axiosClient from './axiosClient.js';

export const assistantApi = {
  // history: [{ role: 'user' | 'assistant', content: string }] — the
  // widget's own last few turns, so follow-ups work without a backend
  // session. Resolves to { reply }.
  ask: (payload) => axiosClient.post('/assistant/ask', payload),
};
