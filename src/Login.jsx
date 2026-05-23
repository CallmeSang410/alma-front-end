import React, { useState } from 'react';
import './Login.css';
import logoEmpresa from './assets/logo.png';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });

const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // 1. Validación de campos
    if (!email.trim()) {
      errors.email = 'El email es obligatorio.';
    } else if (!email.includes('@gmail.com')) {
      errors.email = 'Usa un correo válido de Gmail (@gmail.com).';
    }

    if (!password.trim()) {
      errors.password = 'La contraseña es obligatoria.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({ email: '', password: '' });

    try {
      // =========================================================
      // RUTA A: EL USUARIO QUIERE INICIAR SESIÓN (LOGIN)
      // =========================================================
      if (activeTab === 'login') {
        
        // ¡Volvemos al JSON simple porque tu backend usa UsuarioLogin!
        const datosLogin = {
          email: email,
          password: password
        };

        const respuesta = await fetch('http://127.0.0.1:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, // Cambiamos esto a JSON
          body: JSON.stringify(datosLogin),
        });

if (respuesta.ok) {
        const datosServidor = await respuesta.json();
  
        // ¡Atrapamos el token por su nombre real!
        const tokenReal = datosServidor.tu_gafete_digital;

        if (!tokenReal) {
          alert("Error interno: No se recibió la llave de acceso del servidor.");
          return;
        }
  
        // Guardamos el chorizo de letras real en la memoria
        localStorage.setItem('token', tokenReal);
  
        alert("¡Login Exitoso!");
        onLoginSuccess(); 
      } else {
        setFormErrors({ ...formErrors, password: 'El correo o la contraseña son incorrectos. Intenta de nuevo.' });
      }
      }
      // =========================================================
      // RUTA B: EL USUARIO QUIERE CREAR UNA CUENTA (SIGN UP)
      // =========================================================
      else {
        // Para crear un usuario, FastAPI normalmente espera un JSON limpio
        const datosNuevoUsuario = {
          email: email,
          password: password 
          // Ojo: Si tu backend pide un campo 'nombre', tendrás que agregarlo al formulario visual después
        };

        // Asegúrate de que esta URL sea la correcta en tu main.py (ej: /usuarios o /register)
        const respuesta = await fetch('http://127.0.0.1:8000/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosNuevoUsuario),
        });

        if (respuesta.ok) {
          alert('¡Cuenta creada exitosamente en HorizonFlow! Ahora inicia sesión.');
          // Lo pasamos a la pestaña de login automáticamente para que entre
          setActiveTab('login'); 
          setPassword(''); // Limpiamos la contraseña por seguridad
        } else {
          // Si el correo ya existe, FastAPI debería tirar un error 400
          setFormErrors({ ...formErrors, email: 'Hubo un error al crear la cuenta. Quizás este correo ya está registrado.' });
        }
      }
    } catch (error) {
      console.error("Error de servidor:", error);
      alert("No se pudo conectar con el servidor. Verifica que FastAPI esté encendido.");
    }
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
          <div className="flex flex-col justify-center p-8 md:p-12 animate-fade-in">
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
              <div className="flex gap-1 bg-slate-100 p-1 rounded-full w-fit ring-1 ring-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'login' ? 'text-[#113130] bg-white shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'signup' ? 'text-[#113130] bg-white shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sign up
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {(formErrors.email || formErrors.password) && (
                  <div className="rounded-3xl bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 text-sm shadow-sm">
                    Por favor completa los campos marcados para continuar.
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Correo electrónico <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Sólo @gmail.com</span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      autoComplete="username"
                      placeholder="ejemplo@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                      }}
                      required
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-slate-50 text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border ${formErrors.email ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200'}`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Contraseña <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">8 caracteres mínimo</span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Contraseña segura"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                      }}
                      required
                      className={`w-full pl-12 pr-24 py-3 rounded-2xl text-sm bg-slate-50 text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border ${formErrors.password ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-[#0F766E] hover:text-[#0D9488]"
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                      {formErrors.password}
                    </p>
                  )}
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
                  className="w-full h-12 mt-6 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#0D5F54] hover:to-[#0B7A6F] text-white rounded-[1.25rem] text-sm font-bold uppercase tracking-[0.24em] shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40"
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
