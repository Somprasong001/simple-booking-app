import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// โหลดตัวแปรจากไฟล์ .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // อนุญาตให้ Frontend เรียกใช้ API
app.use(express.json()); // รับข้อมูล JSON จาก Request

// Route สำหรับทดสอบว่า Server ทำงาน
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'Server is running perfectly! 🚀',
    timestamp: new Date().toISOString()
  });
});

// เริ่มต้น Server
app.listen(port, () => {
  console.log(`✅ Server is running on port: ${port}`);
  console.log(`🔗 Test it at: http://localhost:${port}/api/healthcheck`);
});