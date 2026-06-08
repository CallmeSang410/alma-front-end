import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Interface from './Interface';
import FormularioPaciente from './FormularioPaciente'; // 🌟 Tu nueva página

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
        {/* 🌐 RUTA PÚBLICA: El paciente entra aquí y NO le pide contraseña */}
        <Route path="/feedback/:psicologoId" element={<FormularioPaciente />} />

        {/* 🔒 RUTA PRIVADA: Cualquier otra página, ejecuta tu lógica de Login/Interface */}
        <Route path="/*" element={<AplicacionPrivada />} />
      </Routes>
    </BrowserRouter>
  );
}