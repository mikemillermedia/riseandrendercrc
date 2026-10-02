import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Hub from './Hub';
import AdminDashboard from './AdminDashboard'; // <-- Import the new Admin Dashboard

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hub" element={<Hub />} />
        
        {/* Hidden Admin Route */}
        <Route path="/admin" element={<AdminDashboard />} /> 
      </Routes>
    </BrowserRouter>
  );
}
