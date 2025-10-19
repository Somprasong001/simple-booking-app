import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(403).json({ success: false, message: 'Invalid token' });
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};