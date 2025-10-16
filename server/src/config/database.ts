import mongoose from 'mongoose';

/**
 * เชื่อมต่อกับ MongoDB Atlas
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('❌ MONGO_URI is not defined in .env file');
    }

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB Connected Successfully!');
    // แก้ TS18048: ใช้ optional chaining เพื่อเช็ค undefined
    console.log(`📊 Database: ${mongoose.connection?.db?.databaseName || 'Unknown'}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1); // หยุดโปรแกรมถ้าเชื่อมต่อไม่ได้
  }
};

/**
 * จัดการเมื่อเชื่อมต่อขาด
 */
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB Error:', error);
});