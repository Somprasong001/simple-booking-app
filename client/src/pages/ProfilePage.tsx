import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err: any) {
        setError('เกิดข้อผิดพลาดในการโหลดโปรไฟล์');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    window.location.href = '/';  // ไป AuthPage
  };

  if (loading) return <div className="text-center text-slate-500 py-8">กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">โปรไฟล์</h2>
        {user && (
          <div className="space-y-4">
            <p><strong>ชื่อ:</strong> {user.name}</p>
            <p><strong>อีเมล:</strong> {user.email}</p>
            <p><strong>บทบาท:</strong> {user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;