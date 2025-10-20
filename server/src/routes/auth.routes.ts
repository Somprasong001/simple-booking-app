import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// ใช้ค่าเดียวกับใน middleware
const JWT_SECRET = process.env.JWT_SECRET || 'f585caef5a9611a142b60e0be1feb1b7941d759502a569d53b65b4d12aa01e6a';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('Register attempt:', { username, email, role });

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้หรือ อีเมลนี้ใช้งานแล้ว' });
    }

    const user = new User({ username, email, password, role });
    await user.save();
    console.log('✅ User registered:', user._id);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, username, email, role }
    });
  } catch (error: any) {
    console.error('❌ Register error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Login successful:', user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email, role: user.role }
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('❌ Me endpoint error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

export default router;