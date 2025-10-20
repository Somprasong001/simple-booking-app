import axios from 'axios';

// ใช้ localhost สำหรับ dev, Railway สำหรับ production
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:5001/api'  // Development
    : 'https://simple-booking-app-production.up.railway.app/api'  // Production
  );

console.log('🔗 API Base URL:', API_BASE_URL);  // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,  // 10 seconds timeout
  withCredentials: false,  // ไม่ต้องส่ง cookies
});

// Request Interceptor: เพิ่ม token ใน header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: จัดการ error
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message, error.config?.url);

    // Network error (ไม่มี response จาก server)
    if (!error.response) {
      console.error('🔴 Network Error - Server may be down');
      return Promise.reject({
        response: {
          status: 0,
          data: {
            success: false,
            message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้\nกรุณาตรวจสอบว่า Backend กำลังทำงานอยู่ที่ ' + API_BASE_URL
          }
        }
      });
    }

    // CORS error
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('🔴 CORS Error');
      return Promise.reject({
        response: {
          status: 0,
          data: {
            success: false,
            message: 'CORS Error: กรุณาตรวจสอบการตั้งค่า CORS ที่ Backend'
          }
        }
      });
    }

    // 401 Unauthorized - token หมดอายุ
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - clearing token');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // ไม่ redirect ทันที ให้ App.tsx จัดการ
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('⚠️ Forbidden - invalid token');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }

    return Promise.reject(error);
  }
);

// Services API
export const getServices = () => api.get('/services');
export const createService = (data: any) => api.post('/services', data);

// Bookings API
export const getBookings = (params: { date?: string; status?: string }) => 
  api.get('/bookings', { params });
export const createBooking = (data: any) => api.post('/bookings', data);
export const getBookingById = (id: string) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id: string, status: string) => 
  api.patch(`/bookings/${id}/status`, { status });
export const cancelBooking = (id: string) => api.delete(`/bookings/${id}`);

export default api;