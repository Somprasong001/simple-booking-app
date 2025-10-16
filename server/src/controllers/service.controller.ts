import { Request, Response } from 'express';
import Service from '../models/service.model';

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริการ',
      error: error.message
    });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบริการที่ต้องการ'
      });
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริการ',
      error: error.message
    });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration } = req.body;
    if (!name || !description || price === undefined || !duration) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    const service = await Service.create({
      name,
      description,
      price,
      duration
    });
    res.status(201).json({
      success: true,
      message: 'สร้างบริการสำเร็จ',
      data: service
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างบริการ',
      error: error.message
    });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบริการที่ต้องการ'
      });
    }
    res.status(200).json({
      success: true,
      message: 'อัปเดตบริการสำเร็จ',
      data: service
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตบริการ',
      error: error.message
    });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบริการที่ต้องการ'
      });
    }
    res.status(200).json({
      success: true,
      message: 'ลบบริการสำเร็จ'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบบริการ',
      error: error.message
    });
  }
};