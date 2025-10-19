import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/service.controller';
// import { authenticateToken, authorizeRole } from '../middleware/auth';  // ลบชั่วคราว

const router = express.Router();

// GET: เปิดให้ทุกคนดู
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// POST/PUT/DELETE: ลบ middleware ชั่วคราวเพื่อทดสอบ
router.post('/', createService);  // authenticateToken, authorizeRole(['seller', 'admin']),
router.put('/:id', updateService);  // authenticateToken, authorizeRole(['seller', 'admin']),
router.delete('/:id', deleteService);  // authenticateToken, authorizeRole(['admin']),

export default router;