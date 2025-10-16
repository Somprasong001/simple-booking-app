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
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
      error: error.message
    });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { service, customerName, customerEmail, customerPhone, startTime, notes } = req.body;

    if (!service || !customerName || !customerEmail || !customerPhone || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบริการที่เลือก'
      });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + serviceData.duration * 60000);  // ms

    // เช็ค conflict (ไม่รวม cancelled)
    const conflictBooking = await Booking.findOne({
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

    const booking = await Booking.create({
      service,
      customerName,
      customerEmail,
      customerPhone,
      startTime: start,
      endTime: end,
      notes,
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id).populate('service');

    res.status(201).json({
      success: true,
      message: 'สร้างการจองสำเร็จ',
      data: populatedBooking
    });
  } catch (error: any) {
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

    res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: booking
    });
  } catch (error: any) {
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

    res.status(200).json({
      success: true,
      message: 'ยกเลิกการจองสำเร็จ',
      data: booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกการจอง',
      error: error.message
    });
  }
};