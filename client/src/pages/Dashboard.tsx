import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

// Sub-components สำหรับ Seller
const AddServiceForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, duration: 0 });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/services', formData);  // Backend: ผูก sellerId = req.user.userId
      alert('เพิ่มบริการสำเร็จ!');
      navigate('/dashboard?tab=my-services');  // กลับ tab My Services
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-slate-800">เพิ่มบริการใหม่</h3>
      <input type="text" placeholder="ชื่อบริการ" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded mb-4" required />
      <textarea placeholder="รายละเอียด" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded mb-4" required />
      <input type="number" placeholder="ราคา (บาท)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-2 border rounded mb-4" required />
      <input type="number" placeholder="ระยะเวลา (นาที)" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full p-2 border rounded mb-4" required />
      <button type="submit" className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600">เพิ่มบริการ</button>
    </motion.form>
  );
};

const MyServices: React.FC = () => {
  const [services, setServices] = useState([]);  // Fetch จาก /services? sellerId=me

  // useEffect สำหรับ fetch...

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-800">บริการของฉัน</h3>
      {/* Map services เป็น cards เหมือน HomePage */}
      <p className="text-slate-500">ยังไม่มีบริการ – ลองเพิ่มใหม่</p>
    </div>
  );
};

// Sub-components สำหรับ Admin
const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState([]);  // Fetch จาก /users (Admin only)

  // useEffect...

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-800">จัดการผู้ใช้</h3>
      {/* Table: username, email, role, actions (delete/edit) */}
      <p className="text-slate-500">ยังไม่มีผู้ใช้</p>
    </div>
  );
};

const ManageServices: React.FC = () => {
  // คล้าย MyServices แต่ GET all /services
  return <div>จัดการบริการทั้งหมด</div>;
};

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('my-services');
  const navigate = useNavigate();

  const tabs = user.role === 'Admin' ? 
    ['my-services', 'bookings', 'manage-users', 'manage-services'] : 
    ['my-services', 'bookings'];  // Seller: แค่ 2 tabs

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <motion.aside initial={{ x: -250 }} animate={{ x: 0 }} className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-teal-500">{user.username}</h2>
          <p className="text-slate-500">{user.role}</p>
        </div>
        <nav className="p-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left py-2 px-4 rounded mb-2 ${activeTab === tab ? 'bg-teal-100 text-teal-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {tab === 'my-services' && 'บริการของฉัน'}
              {tab === 'bookings' && 'การจองของฉัน'}
              {tab === 'manage-users' && 'จัดการผู้ใช้'}
              {tab === 'manage-services' && 'จัดการบริการ'}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="w-full text-left py-2 px-4 text-red-500 hover:bg-red-50">ออกจากระบบ</button>
      </motion.aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {activeTab === 'my-services' && <MyServices />}
          {activeTab === 'bookings' && <div>ดูการจอง (GET /bookings? sellerId=me หรือ clientId=me)</div>}
          {activeTab === 'manage-users' && <ManageUsers />}
          {activeTab === 'manage-services' && <ManageServices />}
          {activeTab === 'add-service' && <AddServiceForm />}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;  