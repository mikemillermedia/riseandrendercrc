import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Hub from './Hub';
// import CookieConsent from './CookieConsent';
// import { loadAnalytics } from './analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hub" element={<Hub />} />
      </Routes>
    </BrowserRouter>
  );
}
