import { useState } from 'react';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';

function App() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 w-full">  {/* bg-slate-50 แสวงสว่าง */}
      <header className="bg-teal-500 text-white p-4">
        <h1 className="text-2xl font-bold">ระบบจองคิวร้านค้า</h1>
      </header>
      {selectedServiceId ? (
        <BookingPage serviceId={selectedServiceId} onBack={() => setSelectedServiceId(null)} />
      ) : (
        <HomePage onSelectService={setSelectedServiceId} />
      )}
    </div>
  );
}

export default App;