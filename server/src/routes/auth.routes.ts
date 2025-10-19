import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { authenticateToken } from '../middleware/auth';  // ใหม่: Import middleware

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-12345';  // ใช้ env, fallback ถ้าไม่มี

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'อีเมลนี้ใช้งานแล้ว' });
    }
    const user = new User({ name, email, password, role });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: user._id, name, email, role } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Profile (GET /api/auth/me – ต้องล็อกอิน)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;