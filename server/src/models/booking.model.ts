import mongoose, { Document, Schema } from 'mongoose';
import { IService } from './service.model';

export interface IBooking extends Document {
  service: IService['_id'];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'กรุณาเลือกบริการ']
    },
    customerName: {
      type: String,
      required: [true, 'กรุณาระบุชื่อลูกค้า'],
      trim: true,
      maxlength: [100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร']
    },
    customerEmail: {
      type: String,
      required: [true, 'กรุณาระบุอีเมล'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'รูปแบบอีเมลไม่ถูกต้อง']
    },
    customerPhone: {
      type: String,
      required: [true, 'กรุณาระบุเบอร์โทร'],  // ถ้าต้องการ optional: required: false
      trim: true,
      match: [/^[0-9]{9,10}$/, 'เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก']  // ปรับ regex: 9-10 หลัก (ไทย 09xxxxxxxx)
    },
    startTime: {
      type: Date,
      required: [true, 'กรุณาระบุเวลาเริ่มต้น']
    },
    endTime: {
      type: Date,
      required: [true, 'กรุณาระบุเวลาสิ้นสุด']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    notes: {
      type: String,
      maxlength: [500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร']
    }
  },
  {
    timestamps: true
  }
);

// Indexes สำหรับ query เร็ว
BookingSchema.index({ startTime: 1, endTime: 1 });
BookingSchema.index({ customerEmail: 1 });
BookingSchema.index({ status: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);