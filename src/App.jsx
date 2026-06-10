import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Interface from './Interface';
// ✅ PONÉ ESTA (asegurate de usar el nombre correcto del archivo de Dervin):
import Formulario from './Formulario';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


useEffect(() => {
const tamanoFuente = localStorage.getItem('hf_tamano_fuente') || 'normal';
    if (tamanoFuente === 'small') {
        document.documentElement.style.fontSize = '14px';
    } else if (tamanoFuente === 'large') {
        document.documentElement.style.fontSize = '18px';
    } else {
        document.documentElement.style.fontSize = '16px';
    }
  }, []);

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