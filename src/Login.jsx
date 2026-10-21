import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { GoogleLogin } from '@react-oauth/google';
import logoEmpresa from './assets/logo.png';
// 🌟 1. IMPORTAMOS AMBAS COSAS (EL HOOK Y EL PROVIDER)
import { useAlerta, AlertaProvider } from './AlertaContext.jsx';
import api from './api'; // Importás tu instancia configurada

// 🌟 2. LE QUITAMOS EL "export default" A ESTA LÍNEA (lo haremos al final)
function Login({ onLoginSuccess }) {
  
  const { mostrarAlerta } = useAlerta(); // <-- Ya podemos usarlo con confianza

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicMode, setClinicMode] = useState('nueva'); // 'nueva' | 'existente'
  const [clinicName, setClinicName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState('psicologo');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formErrors, setFormErrors] = useState({ email: '', password: '', clinicName: '', inviteCode: '', terms: '' });
  const [showRecuperarModal, setShowRecuperarModal] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');

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

  const validarCamposSignup = () => {
    const errors = {};
    if (clinicMode === 'nueva') {
      if (!clinicName.trim()) {
        errors.clinicName = 'El nombre del consultorio es obligatorio.';
      }
    } else {
      if (!inviteCode.trim()) {
        errors.inviteCode = 'El código de invitación de la clínica es obligatorio.';
      }
    }
    if (!acceptTerms) {
      errors.terms = 'Debes aceptar los términos y condiciones.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const signupListoParaGoogle =
    activeTab === 'signup' &&
    (clinicMode === 'nueva' ? clinicName.trim().length > 0 : inviteCode.trim().length > 0) &&
    acceptTerms;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // En la pestaña Sign up el registro es exclusivamente con Google OAuth
    if (activeTab === 'signup') {
      validarCamposSignup();
      return;
    }

    const errors = {};

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
    
    setFormErrors({ email: '', password: '', clinicName: '', inviteCode: '', terms: '' });
    setIsLoading(true);

    // --- 2. LLAMADA AL BACKEND PARA LOGIN TRADICIONAL (USUARIOS EN TRANSICIÓN) ---
    try {
      const datosLogin = {
        email: email.trim(),
        password: password
      };

      const respuesta = await api.post('/login', datosLogin);
      const datosServidor = respuesta.data;
      const tokenReal = datosServidor.tu_gafete_digital;

      if (!tokenReal) {
        mostrarAlerta('error', 'Error Interno', 'No se recibió la llave de acceso del servidor.'); 
        return;
      }

      localStorage.setItem('token', tokenReal);
      localStorage.setItem('userEmail', datosServidor.email || email.trim()); 
      
      const nombreReal = datosServidor.nombre_clinica || localStorage.getItem('userName') || 'Psicólogo';
      localStorage.setItem('userName', nombreReal);
      if (datosServidor.codigo_invitacion) {
        localStorage.setItem('clinicInviteCode', datosServidor.codigo_invitacion);
      }
      if (datosServidor.rol) {
        localStorage.setItem('userRole', datosServidor.rol);
      }
        
      mostrarAlerta('exito', '¡Bienvenido!', 'Has iniciado sesión exitosamente.'); 
      if (onLoginSuccess) onLoginSuccess(); 

    } catch (error) {
      console.error("Error capturado por Axios:", error);
      
      let errorMsg = 'Hubo un error de conexión con el servidor.';
      
      if (error.response?.data?.detail) {
        const detalle = error.response.data.detail;
        if (typeof detalle === 'string') {
          errorMsg = detalle;
        } else if (Array.isArray(detalle) && detalle.length > 0) {
          errorMsg = `El backend rechazó el formato: ${detalle[0].msg} en el campo ${detalle[0].loc.join(" -> ")}`;
        }
      }
      
      mostrarAlerta('error', 'Acceso Denegado', errorMsg); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. AUTENTICACIÓN CON GOOGLE OAUTH 2.0 ---
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      mostrarAlerta('error', 'Error de Google', 'No se recibió la credencial de autenticación de Google.');
      return;
    }

    if (activeTab === 'signup' && !validarCamposSignup()) {
      mostrarAlerta('error', 'Datos Incompletos', 'Completa los datos de tu clínica y acepta los términos antes de registrarte.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        credential: credentialResponse.credential,
        modo: activeTab,
        tipo_clinica: activeTab === 'signup' ? clinicMode : 'nueva',
        nombre_clinica: activeTab === 'signup' && clinicMode === 'nueva' ? clinicName.trim() : undefined,
        codigo_invitacion: activeTab === 'signup' && clinicMode === 'existente' ? inviteCode.trim().toUpperCase() : undefined,
        rol: activeTab === 'signup' ? role : 'psicologo'
      };

      const respuesta = await api.post('/auth/google', payload);
      const datosServidor = respuesta.data;
      const tokenReal = datosServidor.tu_gafete_digital;

      if (!tokenReal) {
        mostrarAlerta('error', 'Error Interno', 'No se recibió la llave de acceso del servidor.');
        return;
      }

      const correoFinal = datosServidor.email || email;
      const nombreReal = datosServidor.nombre_clinica || localStorage.getItem('userName') || 'Psicólogo';

      localStorage.setItem('token', tokenReal);
      localStorage.setItem('userEmail', correoFinal);
      localStorage.setItem('userName', nombreReal);
      if (datosServidor.codigo_invitacion) {
        localStorage.setItem('clinicInviteCode', datosServidor.codigo_invitacion);
      }
      if (datosServidor.rol) {
        localStorage.setItem('userRole', datosServidor.rol);
      }

      mostrarAlerta(
        'exito',
        datosServidor.es_nuevo_usuario ? '¡Cuenta Creada con Google!' : '¡Bienvenido!',
        datosServidor.es_nuevo_usuario
          ? `Tu cuenta ha sido vinculada a ${nombreReal}.`
          : 'Has iniciado sesión con Google exitosamente.'
      );
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
      const detalle = error.response?.data?.detail;
      const errorMsg = typeof detalle === 'string'
        ? detalle
        : 'No se pudo autenticar tu cuenta de Google con el servidor.';
      mostrarAlerta('error', 'Error con Google', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    mostrarAlerta('error', 'Acceso Cancelado', 'No se pudo completar el inicio de sesión con Google.');
  };
  
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@gmail.com')) {
      mostrarAlerta('error', 'Correo Inválido', 'Ingresa tu email registrado en el campo de arriba para recuperar tu contraseña.'); 
      return;
    }
    // Si escribió un correo, abrimos el modal
    setShowRecuperarModal(true);
  };
const procesarRecuperacion = async () => {
    if (nuevaPassword.length < 8) {
        mostrarAlerta('error', 'Contraseña débil', 'La nueva contraseña debe tener 8 caracteres mínimo.');
        return;
    }

    setIsLoading(true);
    try {
        await api.post('/usuarios/recuperar', {
            email: email.trim(),
            nueva_password: nuevaPassword
        });

        mostrarAlerta('exito', '¡Contraseña Recuperada!', 'Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.');
        setShowRecuperarModal(false);
        setNuevaPassword('');
        setPassword('');
    } catch (error) {
        const msg = error.response?.data?.detail || 'No se pudo recuperar la contraseña.';
        mostrarAlerta('error', 'Error', msg);
    } finally {
        setIsLoading(false);
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
                    : 'Regístrate con tu cuenta verificada de Google'}
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
                      setInviteCode('');
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
                      setInviteCode('');
                      setAcceptTerms(false);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'signup' ? 'text-[#0F766E] bg-white shadow-sm' : 'text-slate-500 hover:text-[#113130]'}`}
                >
                  Sign up
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {(formErrors.email || formErrors.password || formErrors.clinicName || formErrors.inviteCode || formErrors.terms) && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Por favor revisa los campos marcados para continuar.
                  </div>
                )}

                {/* ================= FLUJO DE REGISTRO (SOLO VISIBLE EN SIGN UP) ================= */}
                {activeTab === 'signup' && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Selector: Crear nueva clínica vs Unirse con código */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Modalidad de Consultorio <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setClinicMode('nueva');
                            setFormErrors({ ...formErrors, clinicName: '', inviteCode: '' });
                          }}
                          className={`py-3 px-3 rounded-2xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                            clinicMode === 'nueva'
                              ? 'bg-teal-50/60 border-[#0F766E] text-[#0F766E] shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                          }`}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Crear Clínica
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setClinicMode('existente');
                            setFormErrors({ ...formErrors, clinicName: '', inviteCode: '' });
                          }}
                          className={`py-3 px-3 rounded-2xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                            clinicMode === 'existente'
                              ? 'bg-teal-50/60 border-[#0F766E] text-[#0F766E] shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                          }`}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Unirme con Código
                        </button>
                      </div>
                    </div>

                    {clinicMode === 'nueva' ? (
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
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Código de Invitación de la Clínica <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-bold">Pídelo a tu administrador</span>
                        </div>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Ej. ALMA-8F3K2P"
                            value={inviteCode}
                            onChange={(e) => {
                              setInviteCode(e.target.value.toUpperCase());
                              if (formErrors.inviteCode) setFormErrors({ ...formErrors, inviteCode: '' });
                            }}
                            required
                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-mono uppercase bg-slate-50 font-bold text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:bg-white transition-all border ${formErrors.inviteCode ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200'}`}
                          />
                        </div>
                        {formErrors.inviteCode && (
                          <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                            {formErrors.inviteCode}
                          </p>
                        )}
                      </div>
                    )}

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

                    {/* Checkbox de Términos (SOLO Sign Up) */}
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
                  </div>
                )}

                {/* ================= FLUJO DE LOGIN TRADICIONAL (SOLO VISIBLE EN LOGIN) ================= */}
                {activeTab === 'login' && (
                  <>
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
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0D9488] transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    {/* Submit Button (SOLO EN LOGIN) */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full h-14 mt-8 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-[1.25rem] text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-teal-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40 disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden"
                    >
                      <span className={`transition-all duration-300 ${isLoading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                        Ingresar a la plataforma
                      </span>
                      
                      {/* Spinner (Loading State) */}
                      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isLoading ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
                        <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </button>
                  </>
                )}
              </form>

              {/* ================= DIVISOR Y BOTÓN GOOGLE OAUTH 2.0 ================= */}
              <div className="space-y-4 pt-1">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                    {activeTab === 'login' ? 'O continúa con Gmail' : 'Verificación obligatoria con Gmail'}
                  </span>
                  <div className="border-t border-slate-200 w-full"></div>
                </div>

                <div className="flex justify-center w-full">
                  {activeTab === 'signup' && !signupListoParaGoogle ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        validarCamposSignup();
                        mostrarAlerta(
                          'error',
                          'Completa los datos requeridos',
                          clinicMode === 'nueva'
                            ? 'Ingresa el nombre de tu consultorio y acepta los términos antes de continuar con Google.'
                            : 'Ingresa el código de invitación de tu clínica y acepta los términos antes de continuar con Google.'
                        );
                      }}
                      className="w-full h-12 bg-white hover:bg-slate-50 text-[#113130] border border-slate-200 rounded-full text-xs font-bold tracking-wide shadow-xs transition-all duration-200 flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                      </svg>
                      <span>Registrarse con Google</span>
                    </button>
                  ) : googleClientId ? (
                    <div className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        shape="pill"
                        width="360"
                        text={activeTab === 'login' ? 'continue_with' : 'signup_with'}
                        locale="es"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        mostrarAlerta(
                          'error',
                          'Falta Client ID de Google',
                          'Configura VITE_GOOGLE_CLIENT_ID en el archivo .env de alma-frontend para habilitar el inicio de sesión con Google.'
                        )
                      }
                      className="w-full h-12 bg-white hover:bg-slate-50 text-[#113130] border border-slate-200 rounded-2xl text-xs font-bold tracking-wide shadow-sm transition-all duration-200 flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 disabled:opacity-60"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                      </svg>
                      <span>{activeTab === 'login' ? 'Continuar con Google' : 'Registrarse con Google'}</span>
                    </button>
                  )}
                </div>
              </div>

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
      {/* ================= MODAL DE RECUPERAR CONTRASEÑA ================= */}
      {showRecuperarModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 w-screen h-screen">
          <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-sm" onClick={() => setShowRecuperarModal(false)} />
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 sm:p-8 relative z-10 shadow-2xl animate-fade-in border border-teal-100 flex flex-col">
            
            <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
                <h3 className="text-xl font-black text-[#113130]">Recuperar Acceso</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">Restableciendo contraseña para:<br/><span className="text-[#0F766E] font-bold">{email}</span></p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Nueva Contraseña</label>
                    <input 
                        type="password" 
                        placeholder="Mínimo 8 caracteres" 
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-[#113130] focus:outline-none focus:border-[#0F766E] transition-all"
                    />
                </div>
                
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button" 
                        onClick={() => setShowRecuperarModal(false)} 
                        className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={procesarRecuperacion} 
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-[#0F766E] hover:bg-[#0D9488] shadow-md transition-all disabled:opacity-70"
                    >
                        {isLoading ? 'Guardando...' : 'Restablecer'}
                    </button>
                </div>
            </div>
          </div>
        </div>,
        document.body
      )}
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