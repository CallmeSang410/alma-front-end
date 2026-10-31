import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import api from './api';

const Login = lazy(() => import('./Login'));
const Interface = lazy(() => import('./Interface'));
const Formulario = lazy(() => import('./Formulario'));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F4F8F8] flex flex-col items-center justify-center p-6" role="status" aria-live="polite">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center shadow-md animate-pulse mb-4">
        <span className="text-2xl">🧠</span>
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-[#0F766E] animate-pulse">Cargando HorizonFlow...</p>
    </div>
  );
}

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
  } catch {
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
    } catch {
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
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* 🌐 RUTA PÚBLICA */}
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
        </Suspense>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
