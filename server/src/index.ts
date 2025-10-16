import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS: Allow all origins สำหรับ dev/production (localhost:5173, Vercel, etc.)
app.use(cors({ origin: '*' }));

// Parser for JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // สำหรับ form data

// Test Route
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// Routes สำหรับ Services และ Bookings
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// Handle unhandled promise rejections (ป้องกัน crash)
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// เชื่อมต่อ DB ก่อน start server
connectDB()
  .then(() => {
    app.listen(Number(port), '0.0.0.0', () => {  // แก้: Number(port) เพื่อให้เป็น number
      console.log(`Server is running on port: ${port} (Env: ${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to DB connection:', error);
    process.exit(1);
  });