import React, { useEffect, useState } from 'react';
import { getServices } from '../services/api';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface Props {
  onSelectService: (id: string) => void;
}

const HomePage: React.FC<Props> = ({ onSelectService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServices()
      .then(res => {
        setServices(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading services:', err);
        setError('เกิดข้อผิดพลาดในการโหลดบริการ');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-slate-500 py-8 w-full">กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500 bg-red-50 py-8 rounded-md border border-red-200 m-4 w-full">{error}</div>;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 px-4 pt-4">บริการที่มี</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 pb-8 w-full">
        {services.map(service => (
          <div key={service._id} className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">{service.name}</h2>  {/* แก้: </h2> แทน </p> */}
            <p className="text-slate-600 mb-4 text-sm">{service.description}</p>
            <p className="font-bold text-teal-500 mb-4">ราคา: {service.price} บาท | เวลา: {service.duration} นาที</p>
            <button
              onClick={() => onSelectService(service._id)}
              className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition-colors font-medium"
            >
              จองคิว
            </button>
          </div>
        ))}
      </div>
      {services.length === 0 && (
        <div className="text-center py-8 text-slate-500 w-full">
          ยังไม่มีบริการ – ลองเพิ่มใหม่ใน Backend
        </div>
      )}
    </div>
  );
};

export default HomePage;