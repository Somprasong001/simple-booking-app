import React, { useState } from 'react';
import { createBooking } from '../services/api';

interface Props {
  serviceId: string;
  startTime: string;
  onSuccess: () => void;
}

const BookingForm: React.FC<Props> = ({ serviceId, startTime, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endTime = new Date(new Date(startTime).getTime() + 30 * 60000).toISOString();
      const data = { service: serviceId, customerName, customerEmail, customerPhone, startTime, endTime, notes };
      await createBooking(data);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง – ลองเช็คข้อมูล');
    }
    setLoading(false);
  };

  if (success) return <div className="p-4 bg-green-100 rounded-md text-green-800 text-center">จองสำเร็จ! 🎉</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-slate-800">กรอกข้อมูลการจอง</h3>
      <input
        type="text"
        placeholder="ชื่อ-นามสกุล"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        required
        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="email"
        placeholder="อีเมล"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        required
        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="tel"
        placeholder="เบอร์โทร (9-10 หลัก)"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        required
        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500"
      />
      <textarea
        placeholder="หมายเหตุ (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500"
      />
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-500 text-white py-3 px-4 rounded-md hover:bg-teal-600 disabled:bg-teal-300"
      >
        {loading ? 'กำลังส่ง...' : 'ยืนยันการจอง'}
      </button>
    </form>
  );
};

export default BookingForm;