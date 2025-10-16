import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';

// โหลดตัวแปรจากไฟล์ .env
dotenv.config();

// เชื่อมต่อ MongoDB
connectDB();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

// Middleware
app.use(cors()); // อนุญาตให้ Frontend เรียกใช้ API
app.use(express.json()); // รับข้อมูล JSON จาก Request

// Routes
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'Server is running perfectly! 🚀',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// เริ่มต้น Server
app.listen(port, () => {
  console.log(`✅ Server is running on port: ${port}`);
  console.log(`🔗 Test it at: http://localhost:${port}/api/healthcheck`);
});