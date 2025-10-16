import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getBookings } from '../services/api';
import { format } from 'date-fns';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date | null) => void;  // รับ null จาก DatePicker
  serviceId: string;
  onSelectSlot: (startTime: string) => void;
}

interface Booking {
  _id: string;
  startTime: string;
  endTime: string;
  service: { _id: string; name: string };  // แก้ _id ใน service
}

const Calendar: React.FC<Props> = ({ selectedDate, onDateChange, serviceId, onSelectSlot }) => {
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    getBookings({ date: dateStr })
      .then(res => {
        setBookedSlots(res.data.data.filter((b: Booking) => b.service._id === serviceId));  // ใช้ service._id
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate, serviceId]);

  const availableSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];  // สล็อตตัวอย่าง

  const isSlotBooked = (slot: string) => {
    return bookedSlots.some(b => {
      const bookedStart = format(new Date(b.startTime), 'HH:mm');
      return bookedStart === slot;
    });
  };

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div className="p-4 border rounded">
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}  // รับ date | null
        dateFormat="dd/MM/yyyy"
        className="mb-4 p-2 border rounded"
        placeholderText="เลือกวันที่"
      />
      <h3>สล็อตว่าง: {format(selectedDate, 'dd/MM/yyyy')}</h3>
      <ul className="space-y-2">
        {availableSlots.map(slot => (
          <li key={slot}>
            <button
              onClick={() => onSelectSlot(`${format(selectedDate, 'yyyy-MM-dd')}T${slot}:00.000Z`)}
              disabled={isSlotBooked(slot)}
              className={`w-full p-2 rounded ${isSlotBooked(slot) ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-200 hover:bg-green-300'}`}
            >
              {slot} {isSlotBooked(slot) ? '(จองแล้ว)' : '(ว่าง)'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Calendar;