import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';  // Style พื้นฐาน (เพิ่ม Tailwind ถ้าต้องการ)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);