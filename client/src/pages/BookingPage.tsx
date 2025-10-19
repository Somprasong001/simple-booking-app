import React, { useState } from 'react';
import Calendar from '../components/Calendar';
import BookingForm from '../components/BookingForm';

interface Props {
  serviceId: string;
  onBack: () => void;
}

const BookingPage: React.FC<Props> = ({ serviceId, onBack }) => {
  const [date, setDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSelectSlot = (startTime: string) => {
    setSelectedStartTime(startTime);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedStartTime(null);
    alert('จองสำเร็จ!');
  };

  const handleDateChange = (date: Date | null) => {
    setDate(date || new Date());
  };

  return (
    <div className="w-full">  {/* เต็มจอ */}
      <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 mb-4 ml-4">กลับ</button>
      {!showForm ? (
        <Calendar
          selectedDate={date}
          onDateChange={handleDateChange}
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