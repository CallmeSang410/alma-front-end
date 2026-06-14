import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import logoEmpresa from './assets/Logo.png';
// 🌟 1. IMPORTAMOS AMBAS COSAS (EL HOOK Y EL PROVIDER)
import { useAlerta, AlertaProvider } from './AlertaContext.jsx';

// 🌟 2. LE QUITAMOS EL "export default" A ESTA LÍNEA (lo haremos al final)
function Login({ onLoginSuccess }) {
  
  const { mostrarAlerta } = useAlerta(); // <-- Ya podemos usarlo con confianza

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [role, setRole] = useState('psicologo');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formErrors, setFormErrors] = useState({ email: '', password: '', clinicName: '', terms: '' });

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsType, setTermsType] = useState('terms'); 

  const cssStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
    input, select, button { transition: all 0.2s ease; }
    input:focus, select:focus { box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12); }
    button[type="submit"], button[type="button"] { will-change: transform, box-shadow; }
    button[type="submit"]:active, button[type="button"]:active { transform: scale(0.98); }
    button:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.18); }
  `;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (activeTab === 'signup') {
      if (!clinicName.trim()) {
        errors.clinicName = 'El nombre del consultorio es obligatorio.';
      }
      if (!acceptTerms) {
        errors.terms = 'Debes aceptar los términos y condiciones.';
      }
    }

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
    
    setFormErrors({ email: '', password: '', clinicName: '', terms: '' });
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const datosLogin = {
          email: email,
          password: password
        };

        const respuesta = await fetch('http://127.0.0.1:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosLogin),
        });

       if (respuesta.ok) {
          const datosServidor = await respuesta.json();
          const tokenReal = datosServidor.tu_gafete_digital;

          if (!tokenReal) {
            mostrarAlerta('error', 'Error Interno', 'No se recibió la llave de acceso del servidor.'); 
            return;
          }
  
          localStorage.setItem('token', tokenReal);
          
          // 🌟 AQUÍ ESTÁ EL CAMBIO: Guardamos el correo real del usuario (la variable "email")
          localStorage.setItem('userEmail', email); 
          // Le decimos que intente agarrar el nombre real que manda el backend, 
          // y si el backend no lo manda, que deje el que ya estaba en la memoria, o "Psicólogo" por defecto.
          const nombreReal = datosServidor.nombre_clinica || localStorage.getItem('userName') || 'Psicólogo';
          localStorage.setItem('userName', nombreReal);
          
          mostrarAlerta('exito', '¡Bienvenido!', 'Has iniciado sesión exitosamente.'); 
          if (onLoginSuccess) onLoginSuccess(); 
        } else {
          const errorData = await respuesta.json();
          const errorMsg = typeof errorData.detail === 'string' ? errorData.detail : 'El correo o la contraseña son incorrectos.';
          mostrarAlerta('error', 'Acceso Denegado', errorMsg); 
        }
      } else {
        const datosNuevoUsuario = {
          email: email,
          password: password,
          nombre_clinica: clinicName, 
          rol: role
        };

        const respuesta = await fetch('http://127.0.0.1:8000/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosNuevoUsuario),
        });

        if (respuesta.ok) {
          mostrarAlerta('exito', '¡Cuenta Creada!', 'Se ha creado tu cuenta en HorizonFlow. Ahora inicia sesión.'); 
          setActiveTab('login'); 
          setPassword(''); 
        } else {
          const errorData = await respuesta.json();
          const errorMsg = typeof errorData.detail === 'string' ? errorData.detail : 'Hubo un error al crear la cuenta.';
          mostrarAlerta('error', 'Error de Registro', errorMsg); 
        }
      }
    } catch (error) {
      console.error("Error de servidor:", error);
      mostrarAlerta('error', 'Error de Conexión', 'No se pudo conectar con el servidor. Verifica que FastAPI esté encendido.'); 
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (email) {
      mostrarAlerta('exito', 'Correo Enviado', `Se enviará un enlace de recuperación a ${email}.`); 
    } else {
      mostrarAlerta('error', 'Falta el Correo', 'Ingresa tu email en el campo anterior para recuperar tu contraseña.'); 
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#F4F8F8] to-[#E8F5F5] text-[#113130] flex items-center justify-center p-4 antialiased relative">
      <style>{cssStyles}</style>
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-teal-100/30 overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-96">
          
          {/* ================= COLUMNA IZQUIERDA: FORMULARIO ================= */}
          <div className="flex flex-col justify-center p-8 md:p-12 animate-fade-in relative z-10">
            <div className="space-y-8">
              
              {/* Encabezado */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-[#113130] tracking-tight">
                  Bienvenido
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {activeTab === 'login'
                    ? 'Ingresa a tu cuenta de Horizon Flow'
                    : 'Crea tu cuenta y comienza a gestionar pacientes'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit ring-1 ring-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                      setActiveTab('login');
                      setFormErrors({});
                      setEmail('');
                      setPassword('');
                      setClinicName('');
                      setAcceptTerms(false);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'login' ? 'text-[#0F766E] bg-white shadow-sm' : 'text-slate-500 hover:text-[#113130]'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                      setActiveTab('signup');
                      setFormErrors({});
                      setEmail('');
                      setPassword('');
                      setClinicName('');
                      setAcceptTerms(false);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'signup' ? 'text-[#0F766E] bg-white shadow-sm' : 'text-slate-500 hover:text-[#113130]'}`}
                >
                  Sign up
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {(formErrors.email || formErrors.password || formErrors.clinicName || formErrors.terms) && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Por favor revisa los campos marcados para continuar.
                  </div>
                )}

                {/* NUEVOS CAMPOS: (SOLO visible en Sign Up) */}
                {activeTab === 'signup' && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Campo de Consultorio */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Nombre del consultorio / Clínica <span className="text-rose-500">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Ej. Clínica Bienestar"
                          value={clinicName}
                          onChange={(e) => {
                            setClinicName(e.target.value);
                            if (formErrors.clinicName) setFormErrors({ ...formErrors, clinicName: '' });
                          }}
                          required
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm bg-slate-50 font-bold text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border ${formErrors.clinicName ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200'}`}
                        />
                      </div>
                      {formErrors.clinicName && (
                        <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                          {formErrors.clinicName}
                        </p>
                      )}
                    </div>

                    {/* Selector de Rol */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Rol en la plataforma <span className="text-rose-500">*</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {/* Tarjeta 1: Especialista */}
                        <label className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${role === 'psicologo' ? 'bg-teal-50/50 border-[#0F766E] shadow-sm shadow-teal-100' : 'bg-slate-50 border-slate-200 hover:border-[#0F766E]/30 hover:bg-white'}`}>
                          <input type="radio" name="role" value="psicologo" checked={role === 'psicologo'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                          <div className={`mb-2 p-2 rounded-xl transition-colors ${role === 'psicologo' ? 'bg-[#0F766E] text-white shadow-md shadow-teal-900/20' : 'bg-white text-slate-400 shadow-sm'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${role === 'psicologo' ? 'text-[#0F766E]' : 'text-slate-500'}`}>Especialista</span>
                          {role === 'psicologo' && (
                            <div className="absolute top-2 right-2 text-[#0F766E] animate-fade-in">
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </label>

                        {/* Tarjeta 2: Estudiante */}
                        <label className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${role === 'estudiante' ? 'bg-teal-50/50 border-[#0F766E] shadow-sm shadow-teal-100' : 'bg-slate-50 border-slate-200 hover:border-[#0F766E]/30 hover:bg-white'}`}>
                          <input type="radio" name="role" value="estudiante" checked={role === 'estudiante'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                          <div className={`mb-2 p-2 rounded-xl transition-colors ${role === 'estudiante' ? 'bg-[#0F766E] text-white shadow-md shadow-teal-900/20' : 'bg-white text-slate-400 shadow-sm'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7" /></svg>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${role === 'estudiante' ? 'text-[#0F766E]' : 'text-slate-500'}`}>Estudiante</span>
                          {role === 'estudiante' && (
                            <div className="absolute top-2 right-2 text-[#0F766E] animate-fade-in">
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </label>

                        {/* Tarjeta 3: Recepción */}
                        <label className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${role === 'recepcionista' ? 'bg-teal-50/50 border-[#0F766E] shadow-sm shadow-teal-100' : 'bg-slate-50 border-slate-200 hover:border-[#0F766E]/30 hover:bg-white'}`}>
                          <input type="radio" name="role" value="recepcionista" checked={role === 'recepcionista'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                          <div className={`mb-2 p-2 rounded-xl transition-colors ${role === 'recepcionista' ? 'bg-[#0F766E] text-white shadow-md shadow-teal-900/20' : 'bg-white text-slate-400 shadow-sm'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${role === 'recepcionista' ? 'text-[#0F766E]' : 'text-slate-500'}`}>Recepción</span>
                          {role === 'recepcionista' && (
                            <div className="absolute top-2 right-2 text-[#0F766E] animate-fade-in">
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Correo electrónico <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">Sólo @gmail.com</span>
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
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm bg-slate-50 font-bold text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border ${formErrors.email ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200'}`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Contraseña <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">8 caracteres mínimo</span>
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
                      className={`w-full pl-12 pr-24 py-3.5 rounded-2xl text-sm bg-slate-50 font-bold text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border ${formErrors.password ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[11px] font-black uppercase tracking-widest text-[#0F766E] hover:text-[#0D9488]"
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                {activeTab === 'login' && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0D9488] transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {/* Checkbox de Términos (SOLO Sign Up) */}
                {activeTab === 'signup' && (
                  <div className="pt-2 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <label className="relative flex items-center justify-center mt-0.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-md checked:bg-[#0F766E] checked:border-[#0F766E] transition-all cursor-pointer"
                          checked={acceptTerms}
                          onChange={(e) => {
                            setAcceptTerms(e.target.checked);
                            if (formErrors.terms) setFormErrors({ ...formErrors, terms: '' });
                          }}
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </label>
                      <span className="text-xs text-slate-500 font-medium leading-snug">
                        Al registrarte, aceptas nuestros <button type="button" onClick={() => { setTermsType('terms'); setShowTermsModal(true); }} className="text-[#0F766E] font-bold hover:underline focus:outline-none">Términos de Servicio</button> y <button type="button" onClick={() => { setTermsType('privacy'); setShowTermsModal(true); }} className="text-[#0F766E] font-bold hover:underline focus:outline-none">Política de Privacidad</button> asociados a datos médicos.
                      </span>
                    </div>
                    {formErrors.terms && (
                      <p className="text-[10px] text-rose-600 font-bold mt-2 ml-7">
                        {formErrors.terms}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button (CON ANIMACIÓN DE CARGA) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full h-14 mt-8 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-[1.25rem] text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-teal-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40 disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden"
                >
                  <span className={`transition-all duration-300 ${isLoading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                    {activeTab === 'login' ? 'Ingresar a la plataforma' : 'Crear cuenta'}
                  </span>
                  
                  {/* Spinner (Loading State) */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isLoading ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
                    <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </button>
              </form>

            </div>
          </div>

          {/* ================= COLUMNA DERECHA: LOGO ================= */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#0F766E] to-[#0b5952] border-l border-teal-700/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-teal-800/10 blur-[100px] rounded-full w-96 h-96 m-auto"></div>
            <div className="text-center space-y-1 relative z-10 w-full flex flex-col items-center">
              
              {/* Contenedor del Logo listo para reemplazar por imagen */}
              <div className="flex justify-center w-full max-w-[260px] -mb-1">
                <img src={logoEmpresa} alt="Horizon Flow Logo" className="w-full h-auto object-contain filter drop-shadow-xl rounded-3xl" />
              </div>

              <div className="space-y-0">
                <p className="text-xl font-black text-white leading-snug tracking-wide">
                  Gestión clínica inteligente
                </p>
                <p className="text-sm font-medium text-teal-100/80 leading-relaxed max-w-sm mx-auto">
                  Accede a tu plataforma y simplifica la administración de pacientes y consultas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL DE TÉRMINOS Y POLÍTICAS ================= */}
      {showTermsModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 w-screen h-screen">
          <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-sm" onClick={() => setShowTermsModal(false)} />
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-2xl animate-fade-in border border-teal-100 flex flex-col max-h-[85vh]">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-[#113130] flex items-center gap-3">
                {termsType === 'terms' ? (
                  <><svg className="w-6 h-6 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Términos de Servicio</>
                ) : (
                  <><svg className="w-6 h-6 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Política de Privacidad</>
                )}
              </h3>
              <button type="button" onClick={() => setShowTermsModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Contenido Scrolleable */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-5 text-sm text-slate-600 font-medium hide-scrollbar leading-relaxed">
              {termsType === 'terms' ? (
                <>
                  <p><strong>1. Aceptación:</strong> Al utilizar HorizonFlow, usted y su clínica aceptan estar sujetos a estos términos de uso. Si no está de acuerdo, por favor absténgase de utilizar la plataforma.</p>
                  <p><strong>2. Uso de la plataforma:</strong> HorizonFlow está diseñada exclusivamente para la gestión de expedientes clínicos por profesionales de la salud, administradores y estudiantes autorizados bajo supervisión.</p>
                  <p><strong>3. Responsabilidad Clínica:</strong> HorizonFlow actúa como una herramienta de asistencia administrativa y analítica. Todas las decisiones terapéuticas y diagnósticos son responsabilidad única y exclusiva del profesional de salud mental a cargo.</p>
                  <p><strong>4. Disponibilidad del Servicio:</strong> Nos esforzamos por mantener la plataforma operativa de forma ininterrumpida; sin embargo, pueden ocurrir pausas por mantenimiento programado o causas de fuerza mayor de nuestros servidores.</p>
                </>
              ) : (
                <>
                  <p><strong>1. Recopilación de Datos Sensibles:</strong> Recopilamos información personal y clínica únicamente con fines de gestión médica, resguardando la información bajo estándares de encriptación.</p>
                  <p><strong>2. Privacidad Paciente-Terapeuta:</strong> Los datos ingresados son propiedad del profesional y del paciente. HorizonFlow no comercializa, alquila ni comparte datos clínicos con terceros bajo ninguna circunstancia.</p>
                  <p><strong>3. Seguridad de Infraestructura:</strong> Implementamos medidas de seguridad para proteger el expediente electrónico de accesos no autorizados, cumpliendo con principios de protección de datos médicos.</p>
                  <p><strong>4. Derechos de Acceso:</strong> Usted y sus pacientes mantienen el derecho de solicitar la exportación, rectificación o eliminación completa de su información clínica de nuestras bases de datos en cualquier momento.</p>
                </>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
              <button type="button" onClick={() => setShowTermsModal(false)} className="px-8 py-3.5 bg-[#0F766E] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 hover:bg-[#0D9488] transition-colors">
                He leído y entiendo
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

// 🌟 3. EL HACK MAESTRO: ENVOLVEMOS TU COMPONENTE
export default function LoginConAlertas(props) {
  return (
      <AlertaProvider>
          <Login {...props} />
      </AlertaProvider>
  );
}