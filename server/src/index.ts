import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// แก้ CORS: Allow all origins สำหรับ dev (รวม localhost:5173)
app.use(cors({ origin: '*' }));  // หรือ ['http://localhost:5173', 'https://your-frontend-url']
app.use(express.json());

// Test Route
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// Routes สำหรับ Services และ Bookings
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

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