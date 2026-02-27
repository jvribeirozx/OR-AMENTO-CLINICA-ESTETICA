import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NovoOrcamento  from './pages/NovoOrcamento';
import AssinaturaPage from './pages/AssinaturaPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Navigate to="/admin" />} />
        <Route path="/admin"        element={<AdminDashboard />} />
        <Route path="/admin/novo"   element={<NovoOrcamento />} />
        <Route path="/assinar/:id"  element={<AssinaturaPage />} />
        <Route path="*"             element={<Navigate to="/admin" />} />
      </Routes>
    </BrowserRouter>
  );
}
