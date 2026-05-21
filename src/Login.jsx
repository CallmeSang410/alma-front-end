import React, { useState } from 'react';
import './Login.css';
import logoEmpresa from './assets/logo.png';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Por favor, ingresa tu email y contraseña para continuar.');
      return;
    }

    if (!email.includes('@gmail')) {
      setErrorMessage('Por favor ingresa un email válido de Gmail.');
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
                    placeholder="Email o Usuario"
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-24 py-3 rounded-xl text-sm bg-slate-50 text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-[#0F766E] hover:text-[#0D9488]"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
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
                  className="w-72 h-auto object-contain filter drop-shadow-lg"
                />
              </div>
              <div className="space-y-3">
                <p className="text-lg font-black text-white leading-snug">
                  Gestión clínica inteligente
                </p>
                <p className="text-sm text-teal-50 leading-relaxed">
                  Accede a tu plataforma y simplifica la administración de pacientes y citas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
