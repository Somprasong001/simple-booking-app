import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';  // Import connectDB จาก config

// ถ้ามี routes จาก Phase 2: import serviceRoutes from './routes/serviceRoutes';
// import bookingRoutes from './routes/bookingRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test Route
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// Routes สำหรับ Services และ Bookings (ถ้ามีจาก Phase 2)
// app.use('/api/services', serviceRoutes);
// app.use('/api/bookings', bookingRoutes);

// เชื่อมต่อ DB ก่อน start server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to DB connection:', error);
    process.exit(1);
  });