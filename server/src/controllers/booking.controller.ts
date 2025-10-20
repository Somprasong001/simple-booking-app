import { Request, Response } from 'express';
import Booking from '../models/booking.model';
import Service from '../models/service.model';

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;
    let query: any = {};

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);
      query.startTime = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'name duration price')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error: any) {
    console.error('❌ Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
      error: error.message
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    console.error('❌ Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
      error: error.message
    });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { service, customerName, customerEmail, customerPhone, startTime, endTime, notes } = req.body;

    console.log('📝 Create booking request:', { 
      service, 
      customerName, 
      customerEmail, 
      customerPhone, 
      startTime, 
      endTime,
      notes 
    });

    // Validation
    if (!service || !customerName || !customerEmail || !customerPhone || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (บริการ, ชื่อ, อีเมล, เบอร์โทร, เวลา)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'รูปแบบอีเมลไม่ถูกต้อง'
      });
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      return res.status(400).json({
        success: false,
        message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'
      });
    }

    // Check if service exists
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบริการที่เลือก'
      });
    }

    // Parse dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'รูปแบบวันที่/เวลาไม่ถูกต้อง'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น'
      });
    }

    // Check for past dates
    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถจองย้อนหลังได้'
      });
    }

    // Check for conflicting bookings
    const conflictBooking = await Booking.findOne({
      service,
      status: { $nin: ['cancelled'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
        { startTime: { $gte: start, $lt: end } }
      ]
    });

    if (conflictBooking) {
      return res.status(409).json({
        success: false,
        message: 'ช่วงเวลานี้มีการจองแล้ว กรุณาเลือกเวลาอื่น'
      });
    }

    // Create booking
    const booking = await Booking.create({
      service,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      startTime: start,
      endTime: end,
      notes: notes?.trim() || '',
      status: 'pending'
    });

    // Populate service data
    const populatedBooking = await Booking.findById(booking._id).populate('service');

    console.log('✅ Booking created successfully:', booking._id);

    res.status(201).json({
      success: true,
      message: 'สร้างการจองสำเร็จ',
      data: populatedBooking
    });
  } catch (error: any) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างการจอง',
      error: error.message
    });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะไม่ถูกต้อง'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('service');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }

    console.log('✅ Booking status updated:', booking._id, '→', status);

    res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: booking
    });
  } catch (error: any) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
      error: error.message
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('service');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }

    console.log('✅ Booking cancelled:', booking._id);

    res.status(200).json({
      success: true,
      message: 'ยกเลิกการจองสำเร็จ',
      data: booking
    });
  } catch (error: any) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกการจอง',
      error: error.message
    });
  }
};