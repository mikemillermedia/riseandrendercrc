import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* If they are at the main website URL, show the Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* If they type /login, show the Login Page */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
