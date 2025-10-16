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
      .catch(err => {  // ใช้ err
        console.error('Error loading services:', err);
        setError('เกิดข้อผิดพลาดในการโหลดบริการ');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">กำลังโหลด...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">บริการที่มี</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map(service => (
          <div key={service._id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <p className="text-gray-600">{service.description}</p>
            <p className="font-bold">ราคา: {service.price} บาท | เวลา: {service.duration} นาที</p>
            <button
              onClick={() => onSelectService(service._id)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              จองคิว
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;