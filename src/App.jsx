import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Interface from './Interface';
// ✅ PONÉ ESTA (asegurate de usar el nombre correcto del archivo de Dervin):
import Formulario from './Formulario';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // 🌟 Agrupamos tu lógica original en esta constante
  const AplicacionPrivada = () => {
    if (!isAuthenticated) {
      return <Login onLoginSuccess={handleLogin} />;
    }
    return <Interface onLogout={handleLogout} />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 RUTA PÚBLICA: Ahora apunta al componente de Dervin */}
        <Route path="/feedback/:psicologoId" element={<Formulario />} />

        {/* 🔒 RUTA PRIVADA: Tu dashboard */}
        <Route path="/*" element={<AplicacionPrivada />} />
      </Routes>
    </BrowserRouter>
  );
}