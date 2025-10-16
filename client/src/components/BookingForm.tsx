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
      const endTime = new Date(new Date(startTime).getTime() + 30 * 60000).toISOString();  // +30 นาทีตัวอย่าง
      await createBooking({ service: serviceId, customerName, customerEmail, customerPhone, startTime, endTime, notes });
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง');
    }
    setLoading(false);
  };

  if (success) return <div className="p-4 bg-green-100 rounded">จองสำเร็จ! 🎉</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-4">
      <h3 className="text-lg font-bold">กรอกข้อมูลการจอง</h3>
      <input
        type="text"
        placeholder="ชื่อ-นามสกุล"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        placeholder="อีเมล"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="tel"
        placeholder="เบอร์โทร (10 หลัก)"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="หมายเหตุ (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full p-2 border rounded"
      />
      {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        {loading ? 'กำลังส่ง...' : 'ยืนยันการจอง'}
      </button>
    </form>
  );
};

export default BookingForm;