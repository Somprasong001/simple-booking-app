import React, { useState } from 'react';
import Calendar from '../components/Calendar';
import BookingForm from '../components/BookingForm';

interface Props {
  serviceId: string;
  onBack: () => void;
}

const BookingPage: React.FC<Props> = ({ serviceId, onBack }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSelectSlot = (startTime: string) => {
    setSelectedStartTime(startTime);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedStartTime(null);
    alert('จองสำเร็จ!');  // หรือ redirect
  };

  // แก้ TS: handle null จาก DatePicker
  const handleDateChange = (date: Date | null) => {
    setDate(date || new Date());  // Fallback ถ้า null
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={onBack} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded">กลับ</button>
      {!showForm ? (
        <Calendar
          selectedDate={date}
          onDateChange={handleDateChange}  // ใช้ wrapper function
          serviceId={serviceId}
          onSelectSlot={handleSelectSlot}
        />
      ) : (
        selectedStartTime && (
          <BookingForm
            serviceId={serviceId}
            startTime={selectedStartTime}
            onSuccess={handleSuccess}
          />
        )
      )}
    </div>
  );
};

export default BookingPage;