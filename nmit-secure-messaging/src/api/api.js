import axios from 'axios';

// IMPORTANT: Replace with your backend server's IP address and port.
// If running on a real device, use your computer's local network IP, not 'localhost'.
const API_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});



// Helper to set the Authorization header for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};


// --- AUTH HELPERS ---


export const apiAuth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updatePublicKey: (publicKey) => api.put('/auth/publicKey', { publicKey }),
};

// --- USER HELPERS ---
export const apiUsers = {
  list: (params) => api.get('/users', { params }),
  getPublicKey: (id) => api.get(`/users/${id}/publicKey`),
  // ...add more as needed
};

// --- MESSAGE HELPERS ---
export const apiMessages = {
  getInbox: () => api.get('/messages'),
  getSent: () => api.get('/messages/sent'),
  getById: (id) => api.get(`/messages/${id}`),
  send: (data) => api.post('/messages', data),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  broadcast: (data) => api.post('/messages/broadcast', data),
};
