import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://simple-booking-app-production.up.railway.app/api';  // แทนที่ด้วย Railway URL จริงของคุณ

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Services API
export const getServices = () => api.get('/services');
export const createService = (data: any) => api.post('/services', data);

// Bookings API
export const getBookings = (params: { date?: string; status?: string }) => api.get('/bookings', { params });
export const createBooking = (data: any) => api.post('/bookings', data);
export const getBookingById = (id: string) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status });
export const cancelBooking = (id: string) => api.delete(`/bookings/${id}`);

export default api;