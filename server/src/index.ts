import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';
import authRoutes from './routes/auth.routes';

// โหลด .env ก่อนอย่างอื่น
dotenv.config();

// Debug: ตรวจสอบว่า JWT_SECRET โหลดมาหรือยัง
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set in .env file! Using fallback.');
} else {
  console.log('✅ JWT_SECRET loaded from .env');
}

const app = express();
const port = process.env.PORT || 5001;

// CORS: Allow all origins สำหรับ dev/production
app.use(cors({ origin: '*' }));

// Parser for JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Simple Booking API is running!',
    endpoints: {
      healthcheck: '/api/healthcheck',
      auth: '/api/auth/register, /api/auth/login, /api/auth/me',
      services: '/api/services',
      bookings: '/api/bookings'
    }
  });
});

// Health Check Route
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    jwtConfigured: !!process.env.JWT_SECRET
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// เชื่อมต่อ DB ก่อน start server
connectDB()
  .then(() => {
    app.listen(Number(port), '0.0.0.0', () => {
      console.log(`🚀 Server is running on port: ${port} (Env: ${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server due to DB connection:', error);
    process.exit(1);
  });