import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // ใส่ใน .env

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
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
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;