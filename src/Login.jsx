import React, { useState } from 'react';
import './Login.css';
import logoEmpresa from './assets/logo.png';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Por favor, ingresa tu email y contraseña para continuar.');
      return;
    }

    setErrorMessage('');
    onLoginSuccess();
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();

    if (email) {
      alert(`Se enviará un enlace de recuperación a ${email}.`);
    } else {
      alert('Ingresa tu email en el campo anterior para recuperar tu contraseña.');
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#F4F8F8] to-[#E8F5F5] text-[#113130] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-5xl">
        {/* Contenedor principal con diseño de dos columnas responsivo */}
        <div className="bg-white rounded-3xl shadow-2xl border border-teal-100/30 overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-96">
          
          {/* ================= COLUMNA IZQUIERDA: FORMULARIO ================= */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="space-y-8">
              {/* Encabezado */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-[#113130]">
                  Bienvenido
                </h1>
                <p className="text-sm text-slate-500">
                  {activeTab === 'login'
                    ? 'Ingresa a tu cuenta de Horizon Flow'
                    : 'Crea tu cuenta y comienza a gestionar pacientes'}
                </p>
              </div>

              {/* Tabs (Login / Sign up) */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'login' ? 'text-[#113130] bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'signup' ? 'text-[#113130] bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sign up
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Email Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Email o teléfono"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-slate-50 text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border border-slate-200"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-slate-50 text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border border-slate-200"
                  />
                </div>

                {/* Forgot Password Link */}
                {activeTab === 'login' && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#0D5F54] hover:to-[#0B7A6F] text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {activeTab === 'login' ? 'Ingresar a la plataforma' : 'Crear cuenta'}
                </button>
              </form>

              {/* Divider con "O" */}
              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-semibold">O</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => alert('Login con Google aún no está implementado.')}
                  className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.35 11.1H12V13.95h5.35c-.23 1.25-1.41 3.65-5.35 3.65-3.22 0-5.85-2.65-5.85-5.9s2.63-5.9 5.85-5.9c1.84 0 3.05.79 3.75 1.47l2.55-2.46C17.72 2.93 15.17 1.7 12 1.7 6.48 1.7 2 6.18 2 11.7S6.48 21.7 12 21.7c6.16 0 10.7-4.32 10.7-10.6 0-.72-.08-1.26-.35-1.9z" />
                  </svg>
                  Continuar con Google
                </button>

                <button
                  type="button"
                  onClick={() => alert('Login con LinkedIn aún no está implementado.')}
                  className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5a2.11 2.11 0 1 1 0 4.22 2.11 2.11 0 0 1 0-4.22zM3.5 8.75h3v11.5h-3v-11.5zm7.5 0h2.84v1.57h.04c.4-.76 1.37-1.57 2.82-1.57 3.02 0 3.58 1.99 3.58 4.57v5.93h-3v-5.25c0-1.25-.02-2.86-1.74-2.86-1.74 0-2.01 1.36-2.01 2.76v5.35h-3v-11.5z" />
                  </svg>
                  Continuar con LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA: LOGO (HIDDEN EN MOBILE) ================= */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#0F766E] to-[#0D9488] border-l border-teal-200">
            <div className="text-center space-y-6">
              {/* Logo */}
              <div className="flex justify-center">
                <img 
                  src={logoEmpresa} 
                  alt="Horizon Flow Logo" 
                  className="w-64 h-auto object-contain filter drop-shadow-lg"
                />
              </div>
              
              {/* Texto motivacional */}
              <div className="space-y-3">
                <p className="text-lg font-black text-white leading-snug">
                  Gestión clínica inteligente
                </p>
                <p className="text-sm text-teal-50 leading-relaxed">
                  Accede a tu plataforma y simplifica la administración de pacientes y citas
                </p>
              </div>

              {/* Puntos decorativos */}
              <div className="flex justify-center gap-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
