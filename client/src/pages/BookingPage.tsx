import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

interface Props {
  serviceId: string;
  onBack: () => void;
}

const BookingPage: React.FC<Props> = ({ serviceId, onBack }) => {
  const [service, setService] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${serviceId || id}`);
        setService(res.data);
      } catch (err: any) {
        setError('ไม่สามารถโหลดบริการได้: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchService();
  }, [serviceId, id]);

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleSelectSlot = (startTime: string) => {
    setSelectedStartTime(startTime);
    setShowForm(true);
    setError('');
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStartTime || !customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ 10 หลัก');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const endTime = calculateEndTime(selectedStartTime, service?.duration || 30);
      
      // สร้าง DateTime object สำหรับ startTime และ endTime
      const selectedDate = date.toISOString().split('T')[0];
      const startDateTime = `${selectedDate}T${selectedStartTime}:00`;
      const endDateTime = `${selectedDate}T${endTime}:00`;
      
      const bookingData = {
        service: serviceId || id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        startTime: startDateTime,
        endTime: endDateTime,
        notes: notes.trim() || undefined
      };

      console.log('Sending booking data:', bookingData);
      
      const response = await api.post('/bookings', bookingData);
      
      alert('จองสำเร็จ! คุณจะได้รับการแจ้งเตือนทางอีเมล');
      
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setNotes('');
      setSelectedStartTime(null);
      setShowForm(false);
      
      onBack();
      navigate('/home');
    } catch (err: any) {
      console.error('Booking error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง');
    }
    setLoading(false);
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setSelectedStartTime(null);
    setShowForm(false);
  };

  if (error && !service) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-red-500 text-center p-4">
          {error} 
          <button onClick={() => window.location.reload()} className="ml-2 underline">
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 w-full">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={onBack}
        className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 mb-6 ml-4 transition-colors"
      >
        ← กลับ
      </motion.button>

      {service && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{service.name}</h2>
          <p className="text-slate-600 mb-4">{service.description}</p>
          <p className="text-teal-500 font-bold text-lg">
            ราคา: ฿{service.price} | เวลา: {service.duration} นาที
          </p>
        </motion.div>
      )}

      {!showForm ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">เลือกวันที่</h3>
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">เลือกเวลา (ว่าง)</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {generateTimeSlots().map((slot) => (
                <motion.button
                  key={slot}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectSlot(slot)}
                  className="p-3 bg-slate-100 text-slate-700 rounded-md hover:bg-teal-100 hover:text-teal-600 font-medium transition-colors border border-slate-200"
                >
                  {slot}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        selectedStartTime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-4">ยืนยันการจอง</h3>
            <p className="text-slate-600 mb-2">วันที่: {date.toLocaleDateString('th-TH')}</p>
            <p className="text-slate-600 mb-2">
              เวลา: {selectedStartTime} - {calculateEndTime(selectedStartTime, service?.duration || 30)}
            </p>
            <p className="text-teal-500 font-bold mb-4">ราคา: ฿{service?.price}</p>
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            
            <form onSubmit={handleBook}>
              <div className="mb-4">
                <label className="block text-slate-700 mb-2 font-medium">
                  ชื่อของคุณ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="กรอกชื่อ-นามสกุล"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-700 mb-2 font-medium">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-700 mb-2 font-medium">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0812345678"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-slate-700 mb-2 font-medium">
                  หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม..."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  rows={3}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 text-white py-3 rounded-md hover:bg-teal-600 disabled:bg-teal-300 font-semibold transition-colors"
              >
                {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
              </button>
            </form>
            
            <button
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="w-full mt-2 text-slate-500 underline hover:text-slate-700"
            >
              เปลี่ยนเวลา
            </button>
          </motion.div>
        )
      )}
    </div>
  );
};

export default BookingPage;  