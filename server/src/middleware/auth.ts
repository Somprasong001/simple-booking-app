import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'f585caef5a9611a142b60e0be1feb1b7941d759502a569d53b65b4d12aa01e6a') as any;
    
    // ตรวจสอบว่า user ยังมีอยู่ใน database หรือไม่
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(403).json({ success: false, message: 'User not found' });
    }
    
    // เก็บทั้ง decoded token และ userId ไว้ใช้
    (req as any).user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role protection (optional – ใช้เมื่อต้องการจำกัด role)
export const authorizeRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const user = await User.findById(userId);
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};