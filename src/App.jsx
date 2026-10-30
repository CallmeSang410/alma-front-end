import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import Login from './Login';
import Interface from './Interface';
// ✅ PONÉ ESTA (asegurate de usar el nombre correcto del archivo de Dervin):
import Formulario from './Formulario';
import api from './api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AplicacionPrivada({ isAuthenticated, handleLogin, handleLogout }) {
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />;
  }
  return <Interface onLogout={handleLogout} />;
}

function verificarTokenAlmacenado() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const partes = token.split('.');
    if (partes.length !== 3) throw new Error('Formato JWT inválido');

    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    if (!payload || !payload.usuario_id) {
      throw new Error('Payload sin usuario_id');
    }

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      throw new Error('Token expirado');
    }

    return true;
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('clinicInviteCode');
    return false;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => verificarTokenAlmacenado());

  const handleLogout = useCallback(() => {
    try {
      googleLogout();
    } catch (e) {
      // Ignorar si no había sesión activa de Google
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('clinicInviteCode');
    setIsAuthenticated(false);
  }, []);

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

  useEffect(() => {
    const onSesionExpirada = () => handleLogout();
    window.addEventListener('sesionExpirada', onSesionExpirada);
    return () => window.removeEventListener('sesionExpirada', onSesionExpirada);
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Verificación rápida contra el servidor; si el token fue revocado o es inválido, el interceptor 401 redirige de inmediato
    api.get('/usuarios/me').catch((err) => {
      if (err.response?.status === 401) {
        handleLogout();
      }
    });
  }, [isAuthenticated, handleLogout]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_NOT_CONFIGURED'}>
      <BrowserRouter>
        <Routes>
          {/* 🌐 RUTA PÚBLICA: Ahora apunta al componente de Dervin */}
          <Route path="/feedback/:psicologoId" element={<Formulario />} />

          {/* 🔒 RUTA PRIVADA: Tu dashboard */}
          <Route
            path="/*"
            element={
              <AplicacionPrivada
                isAuthenticated={isAuthenticated}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
