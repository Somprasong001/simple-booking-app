import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface AuthPageProps {
  onLogin: (token: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // เพิ่มการตรวจสอบ username สำหรับการลงทะเบียน
    if (isRegister && username.length < 3) {
      setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
      return;
    }
    
    // เพิ่มการตรวจสอบรหัสผ่าน
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      let res;
      if (isRegister) {
        res = await api.post('/auth/register', { 
          username, 
          email, 
          password, 
          role 
        });
      } else {
        res = await api.post('/auth/login', { email, password });
      }
      const token = res.data.token;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      onLogin(token);
      alert('เข้าสู่ระบบสำเร็จ! กำลังไปหน้า HomePage...');
      navigate('/home');
    } catch (err: any) {
      console.error('Auth error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || 'Server error'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          {isRegister ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
        </h2>
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้ (username) - อย่างน้อย 3 ตัวอักษร"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full p-3 border border-slate-300 rounded-md mb-4 focus:ring-2 focus:ring-teal-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-md mb-4 focus:ring-2 focus:ring-teal-500"
            >
              <option value="Client">ลูกค้า</option>
              <option value="Seller">ผู้ให้บริการ</option>
              <option value="Admin">ผู้ดูแล</option>
            </select>
          </>
        )}
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-slate-300 rounded-md mb-4 focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="password"
          placeholder="รหัสผ่าน - อย่างน้อย 6 ตัวอักษร"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full p-3 border border-slate-300 rounded-md mb-4 focus:ring-2 focus:ring-teal-500"
        />
        {error && <p className="text-red-500 mb-4 text-center bg-red-50 p-2 rounded-md">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 text-white py-3 px-4 rounded-md hover:bg-teal-600 disabled:bg-teal-300"
        >
          {loading ? 'กำลังส่ง...' : (isRegister ? 'ลงทะเบียน' : 'เข้าสู่ระบบ')}
        </button>
        <p className="text-center mt-4 text-slate-600">
          {isRegister ? 'มีบัญชีแล้ว?' : 'ไม่มีบัญชี?'} 
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-teal-500 underline ml-1">
            {isRegister ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;  