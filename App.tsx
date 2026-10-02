import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Hub from './Hub';
import RetainerDashboard from './RetainerDashboard'; // <-- 1. Import the new component
// import CookieConsent from './CookieConsent';
// import { loadAnalytics } from './analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hub" element={<Hub />} />
        
        {/* 2. Add the preview route here */}
        <Route path="/hub/retainer" element={<RetainerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
