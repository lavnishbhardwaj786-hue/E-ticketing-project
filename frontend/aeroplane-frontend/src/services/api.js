import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const flightAPI = {
  search: (params) => api.get('/flights/search', { params }),
  getSeats: (flightId) => api.get(`/flights/${flightId}/seats`),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings/with-payment', data),
  getMyBookings: () => api.get('/bookings/'),
  getBookingPayments: (bookingId) => api.get(`/payments/${bookingId}`),
  cancelBooking: (paymentId) => api.post(`/payments/${paymentId}/refund`),
};

export default api;
