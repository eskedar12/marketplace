// Single place that knows how to talk to the backend.
// Every other file calls these functions instead of using fetch()
// directly — if the API's response shape or base URL ever changes,
// this is the only file that needs to change.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

function getToken() {
  return localStorage.getItem('vintech_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('vintech_token', token);
  else localStorage.removeItem('vintech_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    const message = json.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.details = json.details;
    error.status = res.status;
    throw error;
  }

  return json;
}

// ---- Auth ----
export const authApi = {
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
};

// ---- Categories ----
export const categoriesApi = {
  getAll: () => request('/categories'),
};

// ---- Listings ----
export const listingsApi = {
  search: (params) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return request(`/listings${qs ? `?${qs}` : ''}`);
  },
  getOne: (id) => request(`/listings/${id}`),
  getMine: () => request('/listings/me/mine', { auth: true }),
  create: (data) => request('/listings', { method: 'POST', body: data, auth: true }),
  update: (id, data) => request(`/listings/${id}`, { method: 'PATCH', body: data, auth: true }),
  remove: (id) => request(`/listings/${id}`, { method: 'DELETE', auth: true }),
};

// ---- Favorites ----
export const favoritesApi = {
  add: (listingId) => request(`/favorites/${listingId}`, { method: 'POST', auth: true }),
  remove: (listingId) => request(`/favorites/${listingId}`, { method: 'DELETE', auth: true }),
  getMine: () => request('/favorites', { auth: true }),
};

// ---- Reports ----
export const reportsApi = {
  create: (listingId, reason) =>
    request('/reports', { method: 'POST', body: { listing_id: listingId, reason }, auth: true }),
};

// ---- Conversations / Messages ----
export const conversationsApi = {
  getAll: () => request('/conversations', { auth: true }),
  getOrCreate: (listingId) =>
    request('/conversations', { method: 'POST', body: { listing_id: listingId }, auth: true }),
  getMessages: (conversationId) =>
    request(`/conversations/${conversationId}/messages`, { auth: true }),
  sendMessage: (conversationId, content) =>
    request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
      auth: true,
    }),
};
