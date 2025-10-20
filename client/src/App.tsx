import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import api from './services/api';

function AppContent() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [profileError, setProfileError] = useState(false);
  const isValidatingRef = useRef(false); // ใช้ ref แทน state เพื่อป้องกัน re-render
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      // ป้องกัน validate ซ้ำ
      if (isValidatingRef.current) return;
      
      if (!token) {
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setProfileError(false);
        if (location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
        return;
      }

      // ถ้าอยู่หน้า auth ให้รอจนกว่าจะ login เสร็จ
      if (location.pathname === '/auth') {
        return;
      }

      isValidatingRef.current = true;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setProfileError(false);
        
        // ถ้าอยู่หน้า / (root) ให้ไปหน้า home
        if (location.pathname === '/') {
          navigate('/home', { replace: true });
        }
      } catch (err: any) {
        console.error('Profile fetch failed:', err.response?.status, err.response?.data);
        
        if (err.response?.status === 403 || err.response?.status === 401) {
          // Token invalid - logout
          console.warn('Access forbidden or unauthorized - logging out');
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
          setProfileError(false);
          navigate('/auth', { replace: true });
        } else if (err.response?.status === 0) {
          // Network error - แสดง warning แต่ไม่ logout
          setProfileError(true);
          setUser(null);
        } else {
          // Error อื่นๆ - แสดง warning
          setProfileError(true);
          setUser(null);
        }
      } finally {
        isValidatingRef.current = false;
      }
    };

    validateToken();
  }, [token, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setProfileError(false);
    setSelectedServiceId(null);
    navigate('/auth', { replace: true });
  };

  // Loading state - แสดงขณะ validate
  if (token && !user && !profileError && isValidatingRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      {/* Header: แสดงถ้ามี user */}
      {user && !profileError && (
        <header className="bg-teal-500 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ระบบจองคิวร้านค้า</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">สวัสดี, {user.username} ({user.role})</span>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </header>
      )}
      
      {/* Warning สำหรับ error อื่นๆ */}
      {profileError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้</p>
              <p className="text-sm">บางฟีเจอร์อาจไม่ทำงาน กรุณาลองออกจากระบบแล้วเข้าใหม่</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
      
      <Routes>
        <Route path="/auth" element={<AuthPage onLogin={(tok) => setToken(tok)} />} />
        <Route path="/home" element={<HomePage onSelectService={setSelectedServiceId} />} />
        <Route 
          path="/booking/:id" 
          element={<BookingPage serviceId={selectedServiceId || ''} onBack={() => setSelectedServiceId(null)} />} 
        />
        <Route path="*" element={token && user ? <HomePage onSelectService={setSelectedServiceId} /> : <AuthPage onLogin={(tok) => setToken(tok)} />} />
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