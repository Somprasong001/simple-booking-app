import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  CLIENT = 'Client',
  SELLER = 'Seller',
  ADMIN = 'Admin'
}

export interface IUser extends Document {
  username: string;  // เปลี่ยนจาก name เป็น username
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },  // เพิ่ม unique/minlength
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.CLIENT },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password ก่อน save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password สำหรับ login
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);