import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getBookings } from '../services/api';
import { format } from 'date-fns';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date | null) => void;
  serviceId: string;
  onSelectSlot: (startTime: string) => void;
}

interface Booking {
  _id: string;
  startTime: string;
  endTime: string;
  service: { _id: string; name: string };
}

const Calendar: React.FC<Props> = ({ selectedDate, onDateChange, serviceId, onSelectSlot }) => {
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    getBookings({ date: dateStr })
      .then(res => {
        setBookedSlots(res.data.data.filter((b: Booking) => b.service._id === serviceId));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate, serviceId]);

  const availableSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

  const isSlotBooked = (slot: string) => bookedSlots.some(b => format(new Date(b.startTime), 'HH:mm') === slot);

  const availableCount = availableSlots.filter(slot => !isSlotBooked(slot)).length;

  if (loading) return <div className="text-center text-slate-500 py-8 w-full">กำลังโหลด...</div>;

  return (
    <div className="w-full">  {/* เต็มจอ */}
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        dateFormat="dd/MM/yyyy"
        className="mb-4 p-2 border rounded w-full"
        placeholderText="เลือกวันที่"
      />
      <h3 className="text-lg font-semibold mb-2 text-slate-800 px-4">สล็อตว่าง: {format(selectedDate, 'dd/MM/yyyy')}</h3>
      <p className="text-sm text-slate-600 mb-4 px-4">ว่าง {availableCount}/{availableSlots.length} สล็อต</p>
      <ul className="space-y-2 px-4 pb-8">
        {availableSlots.map(slot => (
          <li key={slot}>
            <button
              onClick={() => !isSlotBooked(slot) && onSelectSlot(`${format(selectedDate, 'yyyy-MM-dd')}T${slot}:00.000Z`)}
              disabled={isSlotBooked(slot)}
              className={`w-full p-3 rounded-md font-medium transition-colors ${
                isSlotBooked(slot)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'  // เข้มขึ้น green-500
              }`}
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