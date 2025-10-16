import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'กรุณาระบุชื่อบริการ'],
      trim: true,
      maxlength: [100, 'ชื่อบริการต้องไม่เกิน 100 ตัวอักษร']
    },
    description: {
      type: String,
      required: [true, 'กรุณาระบุรายละเอียด'],
      maxlength: [500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร']
    },
    price: {
      type: Number,
      required: [true, 'กรุณาระบุราคา'],
      min: [0, 'ราคาต้องมากกว่าหรือเท่ากับ 0']
    },
    duration: {
      type: Number,
      required: [true, 'กรุณาระบุระยะเวลา'],
      min: [15, 'ระยะเวลาต้องอย่างน้อย 15 นาที'],
      max: [480, 'ระยะเวลาต้องไม่เกิน 8 ชั่วโมง (480 นาที)']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IService>('Service', ServiceSchema);