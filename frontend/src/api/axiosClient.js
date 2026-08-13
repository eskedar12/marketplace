import axios from 'axios';

// Single axios instance every api/*.api.js file imports — this is the
// only file that knows the base URL, attaches the JWT, and unwraps
// error responses. If the backend's URL or auth scheme ever changes,
// this is the only file that needs to change.

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach the JWT to every outgoing request if
// we have one. Individual api files never touch headers directly.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vintech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — the backend always responds with
// { success, data } or { success: false, message, details }.
// Unwrap that here so every caller just gets `res.data` back directly
// instead of repeating `res.data.data` everywhere, and turn failures
// into a normal thrown Error with a readable message.
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data;
    const message = payload?.message || error.message || 'Something went wrong';
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.details = payload?.details;

    // A 401 anywhere means the token is missing/expired — clear the
    // stale session so the UI doesn't keep pretending the user is
    // logged in. AuthContext listens for this event.
    if (error.response?.status === 401) {
      localStorage.removeItem('vintech_token');
      localStorage.removeItem('vintech_user');
      window.dispatchEvent(new Event('vintech:unauthorized'));
    }

    return Promise.reject(normalized);
  }
);

export function setToken(token) {
  if (token) localStorage.setItem('vintech_token', token);
  else localStorage.removeItem('vintech_token');
}

export default axiosClient;
