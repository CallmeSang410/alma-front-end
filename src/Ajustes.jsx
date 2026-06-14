import React, { useState, useEffect } from 'react';
import './Ajustes.css';
import { useAlerta, AlertaProvider } from './AlertaContext.jsx'; // 🌟 Importamos las alertas

const IconProfile = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const IconBell = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const IconPalette = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
);
const IconSupport = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const IconShield = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

const Ajustes = () => {
    // 🛡️ ESCUDO ANTI-CHOQUES PARA ALERTAS
    const contextoAlerta = useAlerta();
    const mostrarAlerta = contextoAlerta ? contextoAlerta.mostrarAlerta : (t, tit, msj) => alert(`${tit}: ${msj}`);

    // --- LÓGICA DEL TEMA GLOBAL ---
    const [temaActual, setTemaActual] = useState(() => {
        const temaGuardado = localStorage.getItem('temaHorizon');
        return temaGuardado ? temaGuardado : 'light';
    });

    useEffect(() => {
        const html = document.documentElement; 
        if (temaActual === 'dark') {
            html.classList.add('dark'); 
        } else {
            html.classList.remove('dark'); 
        }
        localStorage.setItem('temaHorizon', temaActual); 
    }, [temaActual]);

    useEffect(() => {
        const sincronizarDesdeCampana = () => {
            const horas = parseInt(localStorage.getItem('hf_alerta_horas')) || 24;
            setPreferenciasData(prev => ({...prev, anticipacion_alerta: horas}));
        };

        window.addEventListener('configuracionAlertasActualizada', sincronizarDesdeCampana);
        return () => window.removeEventListener('configuracionAlertasActualizada', sincronizarDesdeCampana);
    }, []);

    const [activeTab, setActiveTab] = useState('perfil'); 
    const [isSaving, setIsSaving] = useState(false);

    // MOCK DATA: Perfil (AHORA SÍ CONECTADO A LA MEMORIA REAL)
    const [perfilData, setPerfilData] = useState({
        // 🌟 Usamos la misma llave exacta que guardamos en el Login: 'userEmail'
        email: localStorage.getItem('userEmail') || 'usuario@gmail.com', 
        
        rol: 'Administrador Clínico',
        
        // 🌟 Usamos la misma llave exacta del nombre/rol: 'userName'
        nombreClinica: localStorage.getItem('userName') || 'HorizonFlow Central', 
        
        passwordActual: '',
        passwordNueva: ''
    });

    // MOCK DATA: Preferencias Globales
    const [preferenciasData, setPreferenciasData] = useState({
        anticipacion_alerta: parseInt(localStorage.getItem('hf_alerta_horas')) || 24,
        tamanoFuente: localStorage.getItem('hf_tamano_fuente') || 'normal' 
    });

    const [reporteBug, setReporteBug] = useState({ asunto: '', descripcion: '' });

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);

        if (activeTab === 'perfil') {
            localStorage.setItem('hf_nombre_clinica', perfilData.nombreClinica || 'Usuario Activo');
            localStorage.setItem('hf_email', perfilData.email);
            window.dispatchEvent(new Event('perfilActualizado'));
            // 🌟 ALERTA DE PERFIL
            mostrarAlerta('exito', 'Perfil Actualizado', 'Tus credenciales y datos clínicos se han guardado.');
        }

        if (activeTab === 'alertas') {
            localStorage.setItem('hf_alerta_horas', preferenciasData.anticipacion_alerta);
            window.dispatchEvent(new Event('configuracionAlertasActualizada'));
            // 🌟 ALERTA DE NOTIFICACIONES
            mostrarAlerta('exito', 'Alertas Configuradas', `Te avisaremos ${preferenciasData.anticipacion_alerta} horas antes de cada cita.`);
        }

        if (activeTab === 'temas') {
            localStorage.setItem('hf_tamano_fuente', preferenciasData.tamanoFuente);
            if (preferenciasData.tamanoFuente === 'small') {
                document.documentElement.style.fontSize = '14px'; 
            } else if (preferenciasData.tamanoFuente === 'large') {
                document.documentElement.style.fontSize = '18px'; 
            } else {
                document.documentElement.style.fontSize = '16px'; 
            }
            // 🌟 ALERTA DE APARIENCIA
            mostrarAlerta('exito', 'Apariencia Guardada', 'Se ha actualizado el tamaño del texto general.');
        }

        setTimeout(() => {
            setIsSaving(false);
        }, 800);
    };
    // 🌟 ESTA ES LA FUNCIÓN QUE HACE QUE EL BOTÓN VERDE FUNCIONE
    const handleGuardarCambios = async (e) => {
        e.preventDefault();

        // 1. Guardamos el nuevo nombre en el navegador para que no se borre al recargar
        localStorage.setItem('userName', perfilData.nombreClinica);
        
        // Disparamos el evento para que el Header (arriba a la derecha) cambie el nombre al instante
        window.dispatchEvent(new Event('perfilActualizado'));

        // 2. Avisarle al Backend (Python) si hay un cambio de contraseña
        if (perfilData.passwordNueva) {
            try {
                const token = localStorage.getItem('token');
                
                // ⚠️ OJO: Dervin tiene que tener un endpoint en FastAPI para actualizar esto
                const respuesta = await fetch('http://127.0.0.1:8000/usuarios/actualizar', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombre_clinica: perfilData.nombreClinica,
                        password: perfilData.passwordNueva // Mandamos la nueva clave a la Base de Datos
                    })
                });

                if (respuesta.ok) {
                    mostrarAlerta('exito', 'Perfil Actualizado', 'Tu nombre y contraseña han sido guardados.');
                    setPerfilData({...perfilData, passwordActual: '', passwordNueva: ''}); // Limpiamos los campos
                } else {
                    mostrarAlerta('error', 'Error', 'No se pudo guardar la contraseña en la base de datos.');
                }
            } catch (error) {
                mostrarAlerta('error', 'Error de conexión', 'No hay respuesta del servidor.');
            }
        } else {
            // Si solo cambió el nombre y NO la contraseña, solo mostramos éxito
            mostrarAlerta('exito', 'Perfil Actualizado', 'Nombre del consultorio actualizado con éxito.');
        }
    };
    const renderPerfil = () => (
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in-up">
            <div>
                <h3 className="text-lg font-black text-[#113130]">Mi Perfil y Clínica</h3>
                <p className="text-xs text-slate-500 mt-1">Actualiza tus credenciales y el nombre público de tu consultorio.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xl font-black shadow-inner">{perfilData.nombreClinica ? perfilData.nombreClinica.charAt(0) : 'U'}</div>
                <div>
                    <p className="text-sm font-bold text-[#113130]">{perfilData.nombreClinica || 'Usuario Activo'}</p>
                    <p className="text-xs text-[#0F766E] font-medium uppercase tracking-wider">{perfilData.rol}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                        <input type="email" value={perfilData.email} onChange={(e) => setPerfilData({...perfilData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#113130] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all bg-white" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Comercial / Clínica</label>
                        <input type="text" value={perfilData.nombreClinica} onChange={(e) => setPerfilData({...perfilData, nombreClinica: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#113130] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all bg-white" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contraseña Actual</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#113130] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all bg-white" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nueva Contraseña</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#113130] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all bg-white" />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
    type="button" 
    onClick={handleGuardarCambios}
    className="px-8 py-3.5 bg-[#0F766E] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 hover:bg-[#0D9488] transition-colors"
>
    Guardar Cambios
</button>
            </div>
        </form>
    );

    const renderAlertas = () => (
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in-up">
            <div>
                <h3 className="text-lg font-black text-[#113130]">Alertas del Sistema</h3>
                <p className="text-xs text-slate-500 mt-1">Configura las notificaciones para tus citas y tareas médicas.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-[#113130] mb-1">Avisos de Citas Pendientes</h4>
                <p className="text-xs text-slate-500 mb-4">El sistema te alertará en la cabecera cuando falte este tiempo para tu próxima sesión.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[24, 48, 72].map(horas => (
                        <button key={horas} type="button" onClick={() => setPreferenciasData({...preferenciasData, anticipacion_alerta: horas})} className={`py-3 rounded-xl text-xs font-bold transition-all border ${preferenciasData.anticipacion_alerta === horas ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-teal-300'}`}>
                            {horas} Horas antes
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all">{isSaving ? 'Guardando...' : 'Guardar Preferencias'}</button>
            </div>
        </form>
    );

    const renderTemas = () => {
        const getPreviewTextSizeClass = () => {
            if (preferenciasData.tamanoFuente === 'small') return 'text-xl';
            if (preferenciasData.tamanoFuente === 'large') return 'text-4xl';
            return 'text-2xl';
        };

        const getPreviewDescSizeClass = () => {
            if (preferenciasData.tamanoFuente === 'small') return 'text-[10px]';
            if (preferenciasData.tamanoFuente === 'large') return 'text-sm';
            return 'text-xs';
        };

        const previewBoxClass = 'bg-slate-50/80 border-slate-200';
        const previewTitleClass = 'text-[#113130]';
        const previewDescClass = 'text-slate-500';
        const previewBadgeClass = 'bg-white text-slate-400 border-slate-100';

        return (
            <form onSubmit={handleSave} className="space-y-6 animate-fade-in-up">
                <div>
                    <h3 className="text-lg font-black text-[#113130]">Apariencia y Accesibilidad</h3>
                    <p className="text-xs text-slate-500 mt-1">La paleta de HorizonFlow se mantiene fija en su color original. Aquí puedes ajustar el tamaño del texto para mayor comodidad.</p>
                </div>

                <div className={`${previewBoxClass} p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[140px] text-center transition-all duration-300`}>
                    <span className={`${previewBadgeClass} text-[10px] font-black uppercase tracking-widest mb-3 px-3 py-1 rounded-full shadow-sm border`}>Vista Previa</span>
                    <h2 className={`${getPreviewTextSizeClass()} font-sans font-black ${previewTitleClass} transition-all duration-300 ease-in-out`}>
                        HorizonFlow
                    </h2>
                    <p className={`${getPreviewDescSizeClass()} font-sans ${previewDescClass} mt-2 max-w-sm transition-all duration-300 ease-in-out leading-relaxed`}>
                        El diagnóstico temprano y el tratamiento adecuado son fundamentales para el bienestar emocional del paciente.
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tamaño de Texto</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { key: 'small', label: 'Pequeño' },
                            { key: 'normal', label: 'Normal' },
                            { key: 'large', label: 'Grande' }
                        ].map(option => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setPreferenciasData({ ...preferenciasData, tamanoFuente: option.key })}
                                className={`py-3 rounded-xl text-xs font-bold transition-all border ${preferenciasData.tamanoFuente === option.key ? 'bg-[#0F766E] border-[#0F766E] text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-colors gap-4">
                    <div>
                        <h4 className="text-sm font-bold text-[#113130] flex items-center gap-2">
                            {temaActual === 'dark' ? '🌙 Modo Oscuro Activado' : '☀️ Modo Claro Activado'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">Alterna la paleta de colores de la interfaz.</p>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => {
                            setTemaActual(temaActual === 'light' ? 'dark' : 'light');
                            // 🌟 ALERTA TEMA (Opcional, puede ser mucho si cambias seguido)
                            mostrarAlerta('exito', 'Apariencia Actualizada', temaActual === 'light' ? 'Modo Oscuro activado' : 'Modo Claro activado');
                        }}
                        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2 ${
                            temaActual === 'dark' ? 'bg-[#0F766E]' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={temaActual === 'dark'}
                    >
                        <span className="sr-only">Alternar modo oscuro</span>
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                                temaActual === 'dark' ? 'translate-x-7' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all">
                        {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
                    </button>
                </div>
            </form>
        );
    };

    const renderSoporte = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h3 className="text-lg font-black text-[#113130]">Soporte y Ayuda</h3>
                <p className="text-xs text-slate-500 mt-1">Centro de resolución de problemas técnicos y asistencia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* TARJETA DE CONTACTO DIRECTO */}
                <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 h-fit">
                    <h4 className="text-sm font-bold text-[#113130] flex items-center gap-2 mb-2">
                        <IconSupport /> Contacto Directo
                    </h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                        Si experimentas problemas con el análisis de IA o la agenda, contáctanos inmediatamente:
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-lg drop-shadow-sm">📧</span>
                            <a href="mailto:horizonflowdesign@gmail.com" className="text-[#0F766E] font-bold hover:underline">
                                horizonflowdesign@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-lg drop-shadow-sm">🇳🇮</span>
                            <span className="text-slate-600 font-bold">+505 7853-8041</span>
                        </div>
                    </div>
                </div>

                {/* FORMULARIO DE REPORTE (CON ALERTA AHORA) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-rose-600 flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Reportar un Problema
                    </h4>
                    <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wider font-bold">
                        ¿Encontraste un error en el sistema?
                    </p>
                    
                    <form 
                        onSubmit={(e) => { 
                            e.preventDefault(); 
                            window.location.href = `mailto:horizonflowdesign@gmail.com?subject=Reporte Técnico: ${reporteBug.asunto}&body=${reporteBug.descripcion}`;
                            setReporteBug({asunto: '', descripcion: ''}); 
                            // 🌟 ALERTA DE REPORTE ENVIADO
                            mostrarAlerta('exito', 'Redirigiendo a tu correo', 'Se abrirá tu cliente de correo para enviar el reporte. ¡Gracias por avisarnos!');
                        }} 
                        className="space-y-3"
                    >
                        <input 
                            type="text" 
                            required
                            placeholder="Asunto (Ej. Error al guardar reporte de IA)" 
                            value={reporteBug.asunto} 
                            onChange={(e) => setReporteBug({...reporteBug, asunto: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all" 
                        />
                        <textarea 
                            required
                            rows="4" 
                            placeholder="Pasos que seguiste antes de que ocurriera el error..." 
                            value={reporteBug.descripcion} 
                            onChange={(e) => setReporteBug({...reporteBug, descripcion: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all resize-none" 
                        />
                        <button 
                            type="submit" 
                            className="w-full bg-[#113130] hover:bg-[#0F766E] text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            Enviar Reporte
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    const renderPoliticas = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h3 className="text-lg font-black text-[#113130]">Condiciones y Políticas</h3>
                <p className="text-xs text-slate-500 mt-1">Acuerdos legales, protección de datos y cumplimiento ético.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-[#113130] flex items-center gap-2"><IconShield /> Privacidad y Cumplimiento HIPAA</h4>
                </div>
                <div className="p-5 text-xs text-slate-600 space-y-4 leading-relaxed h-64 overflow-y-auto scrollbar-thin">
                    <p><strong>1. Confidencialidad de Datos Clínicos:</strong> Todo el historial clínico, notas de sesión y datos procesados en HorizonFlow están encriptados de extremo a extremo tanto en tránsito (TLS 1.2+) como en reposo.</p>
                    <p><strong>2. Uso de Motores de IA (Google Gemini):</strong> El motor de inteligencia artificial actúa únicamente como un asistente técnico de estructuración de textos. Los datos enviados al motor de lenguaje (LLM) están desprovistos de Identificadores Personales Directos (PII) que expongan la identidad del paciente.</p>
                    <p><strong>3. Responsabilidad Médica:</strong> HorizonFlow es una herramienta de asistencia administrativa. Es obligación estricta del psicólogo titular revisar, editar si es necesario, y validar científicamente cualquier diagnóstico, resumen o plan de acción emitido por el sistema antes de firmarlo y añadirlo al expediente del paciente.</p>
                    <p><strong>4. Retención de Datos:</strong> Al eliminar un paciente del sistema, todos sus historiales, reportes y metadatos asociados son eliminados permanentemente de nuestras bases de datos sin posibilidad de recuperación, cumpliendo con las normativas internacionales del derecho al olvido.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto font-sans pb-16">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-black text-[#113130] tracking-tight">Ajustes del Sistema</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Gestiona tu perfil, apariencia y configuración global.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
                {/* Menú Lateral Interno */}
                <aside className="w-full md:w-56 lg:w-64 shrink-0 animate-fade-in-up">
                    <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                        {[
                            { id: 'perfil', label: 'Perfil y Clínica', icon: <IconProfile /> },
                            { id: 'alertas', label: 'Alertas', icon: <IconBell /> },
                            { id: 'temas', label: 'Apariencia', icon: <IconPalette /> },
                            { id: 'soporte', label: 'Soporte', icon: <IconSupport /> },
                            { id: 'politicas', label: 'Políticas', icon: <IconShield /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-white text-[#0F766E] shadow-sm border border-slate-100' 
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-[#113130] border border-transparent'
                                }`}
                            >
                                <span className={activeTab === tab.id ? 'text-[#0F766E]' : 'text-slate-400'}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Área de Contenido Dinámico */}
                <div className="flex-1">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
                        {activeTab === 'perfil' && renderPerfil()}
                        {activeTab === 'alertas' && renderAlertas()}
                        {activeTab === 'temas' && renderTemas()}
                        {activeTab === 'soporte' && renderSoporte()}
                        {activeTab === 'politicas' && renderPoliticas()}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; opacity: 0; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
            `}</style>
        </div>
    );
};

// 🌟 HACK ANTI-CHOQUES PARA AJUSTES
export default function AjustesIntegrados(props) {
    return (
        <AlertaProvider>
            <Ajustes {...props} />
        </AlertaProvider>
    );
}