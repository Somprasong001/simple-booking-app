import express from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking
} from '../controllers/booking.controller';
// import { authenticateToken } from '../middleware/auth';  // Comment ชั่วคราว

const router = express.Router();

// GET: เปิดให้ทุกคนดู
router.get('/', getAllBookings);
router.get('/:id', getBookingById);

// POST/PATCH/DELETE: ลบ middleware ชั่วคราวเพื่อทดสอบ (เพิ่มกลับหลัง auth เสร็จ)
router.post('/', createBooking);  // authenticateToken, 
router.patch('/:id/status', updateBookingStatus);  // authenticateToken,
router.delete('/:id', cancelBooking);  // authenticateToken,

export default router;