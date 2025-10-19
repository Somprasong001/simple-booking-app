import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import api from './services/api';

function AppContent() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [profileError, setProfileError] = useState(false);  // Flag สำหรับ 403 – ไม่ลบ token ทันที
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setProfileError(false);
        if (window.location.pathname !== '/auth') {
          navigate('/auth');
        }
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setProfileError(false);
        if (window.location.pathname === '/auth') {
          navigate('/home');
        }
      } catch (err: any) {
        console.error('Profile fetch failed:', err);
        if (err.response?.status === 403) {
          // 403: Token valid แต่ role/permission fail – set flag แต่ไม่ลบ token (fallback to guest mode)
          setProfileError(true);
          setUser(null);  // Hide header แต่ allow access public pages
        } else {
          // Other errors (401, 500): ลบ token
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
          setProfileError(false);
          if (window.location.pathname !== '/auth') {
            navigate('/auth');
          }
        }
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setProfileError(false);
    setSelectedServiceId(null);
    navigate('/auth');
  };

  // ถ้าไม่มี token ให้ render แค่ Auth
  if (!token) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage onLogin={(tok) => setToken(tok)} />} />
        <Route path="*" element={<AuthPage onLogin={(tok) => setToken(tok)} />} />  {/* Fallback */}
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      {/* Header: แสดงถ้ามี user เต็มๆ (ไม่ใช่ profileError) */}
      {user && !profileError && (
        <header className="bg-teal-500 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ระบบจองคิวร้านค้า</h1>
          <div className="flex space-x-4">
            <span className="text-sm">สวัสดี, {user.username}</span>
            <button onClick={handleLogout} className="text-white hover:text-slate-200">ออกจากระบบ</button>
          </div>
        </header>
      )}
      {/* ถ้า profileError: แสดง warning แต่ allow access */}
      {profileError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>สิทธิ์การเข้าถึงจำกัด – บางฟีเจอร์อาจไม่ทำงานเต็มที่</p>
          <button onClick={handleLogout} className="ml-2 underline">ออกจากระบบ</button>
        </div>
      )}
      <Routes>
        <Route path="/auth" element={<AuthPage onLogin={(tok) => setToken(tok)} />} />
        <Route path="/home" element={<HomePage onSelectService={setSelectedServiceId} />} />
        <Route path="/booking/:id" element={<BookingPage serviceId={selectedServiceId || ''} onBack={() => setSelectedServiceId(null)} />} />
        <Route path="/" element={<HomePage onSelectService={setSelectedServiceId} />} />
        <Route path="*" element={<HomePage onSelectService={setSelectedServiceId} />} />  {/* Fallback to home */}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;