import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // เพิ่มสำหรับ navigate
import { motion } from 'framer-motion';  // สำหรับ animations
import { getServices } from '../services/api';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  sellerId?: string;  // Optional สำหรับ populate ทีหลัง
}

interface Props {
  onSelectService: (id: string) => void;
}

const HomePage: React.FC<Props> = ({ onSelectService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getServices();
        setServices(res.data.data || []);  // Handle ถ้า data ไม่มี
      } catch (err: any) {
        console.error('Error loading services:', err);
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดบริการ');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleRetry = () => {
    // Reset และ fetch ใหม่
    setError(null);
    // Trigger useEffect ด้วย dependency ถ้าต้องการ แต่ที่นี่เรียก fetch ตรงๆ
  };

  const handleSelectService = (id: string) => {
    onSelectService(id);
    navigate(`/booking/${id}`);  // Navigate ไป booking page ทันที
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-500 py-8"
        >
          กำลังโหลดบริการ...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-red-50 p-8 rounded-lg border border-red-200 m-4 w-full max-w-md"
        >
          <h2 className="text-red-500 font-semibold mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition-colors"
          >
            ลองโหลดใหม่
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full">  {/* Full screen */}
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center text-slate-800"
        >
          บริการที่มี
        </motion.h1>
        {services.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}  // Stagger animation
                whileHover={{ scale: 1.02, y: -5 }}  // Hover lift up
                className="bg-white p-6 rounded-lg shadow-md border border-slate-200 overflow-hidden group"
              >
                <h2 className="text-xl font-semibold text-slate-800 mb-2">{service.name}</h2>
                <p className="text-slate-600 mb-4 text-sm line-clamp-3">{service.description}</p>  {/* Truncate ถ้ายาว */}
                <div className="mb-4">
                  <p className="font-bold text-teal-500 text-lg">ราคา: {service.price} บาท</p>
                  <p className="text-slate-500 text-sm">เวลา: {service.duration} นาที</p>
                </div>
                <button
                  onClick={() => handleSelectService(service._id)}
                  className="w-full bg-teal-500 text-white py-3 px-4 rounded-md hover:bg-teal-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  จองคิวเลย!
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-slate-500 w-full"
          >
            <div className="text-6xl mb-4">📅</div>  {/* Emoji placeholder */}
            <h2 className="text-2xl font-semibold text-slate-600 mb-2">ยังไม่มีบริการ</h2>
            <p className="mb-4">ลองเพิ่มบริการใหม่ใน Seller Dashboard หรือติดต่อ Admin</p>
            <button
              onClick={handleRetry}
              className="bg-slate-200 text-slate-700 py-2 px-6 rounded-md hover:bg-slate-300 transition-colors"
            >
              รีเฟรช
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomePage;