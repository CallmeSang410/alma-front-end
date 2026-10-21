import React, { useState, useEffect, useRef } from 'react'; 
import api from './api'; // Importás tu instancia configurada

const CampanaAlertas = () => {
    const [alertas, setAlertas] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('alertas');
    
    const [horasAnticipacion, setHorasAnticipacion] = useState(() => {
        return parseInt(localStorage.getItem('hf_alerta_horas')) || 24;
    });
    
    // La referencia de la campana
    const campanaRef = useRef(null); 
    
    // EFECTO CLICK/FOCUS OUTSIDE Y TECLA ESCAPE
    useEffect(() => {
        const handleOutside = (event) => {
            if (campanaRef.current && !campanaRef.current.contains(event.target)) {
                setIsOpen(false); 
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                setIsOpen(false);
            }
        };

        const handleToggleEvent = () => {
            setIsOpen(prev => !prev);
        };

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('focusin', handleOutside);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('toggleCampanaAlertas', handleToggleEvent);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('focusin', handleOutside);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('toggleCampanaAlertas', handleToggleEvent);
        };
    }, [isOpen]);

    // MOTOR REAL: Conexión directa con tu FastAPI mediante AXIOS
    const revisarAlertasReal = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/citas/alertas-activas?horas=${horasAnticipacion}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const citasDB = res.data;
            const ahora = new Date();

            const alertasProcesadas = citasDB.map(cita => {
                const fechaCita = new Date(cita.fecha_cita);
                const diferenciaMs = fechaCita - ahora;
                const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
                const diferenciaMinutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

                let textoTiempo = '';
                if (diferenciaHoras > 0) {
                    textoTiempo = `${diferenciaHoras}h ${diferenciaMinutos}m`;
                } else {
                    textoTiempo = `${diferenciaMinutos} min`;
                }

                return {
                    id: cita.id,
                    patientName: cita.paciente ? cita.paciente.nombre : "Paciente",
                    date: fechaCita.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                    time: fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    reason: cita.motivo_consulta || "Consulta General",
                    timeLeft: textoTiempo,
                    horasFaltantes: diferenciaHoras
                };
            });

            setAlertas(alertasProcesadas);
            
        } catch (error) {
            console.error("Error cargando alertas reales del backend:", error);
        }
    };

    useEffect(() => {
        revisarAlertasReal();

        const sincronizarDesdeAjustes = () => {
            const nuevasHoras = parseInt(localStorage.getItem('hf_alerta_horas')) || 24;
            setHorasAnticipacion(nuevasHoras);
        };

        window.addEventListener('configuracionAlertasActualizada', sincronizarDesdeAjustes);
        
        const escucharCambios = () => {
            revisarAlertasReal();
        };
        window.addEventListener('actualizarRadarCitas', escucharCambios);

        const intervalo = setInterval(revisarAlertasReal, 60000); 
        
        return () => {
            clearInterval(intervalo);
            window.removeEventListener('actualizarRadarCitas', escucharCambios);
            window.removeEventListener('configuracionAlertasActualizada', sincronizarDesdeAjustes);
        };
    }, [horasAnticipacion]);

    const cambiarConfiguracion = (horas) => {
        setHorasAnticipacion(horas);
        localStorage.setItem('hf_alerta_horas', horas);
        setView('alertas');
        window.dispatchEvent(new Event('configuracionAlertasActualizada'));
    };

    return (
        <div className="static font-sans" ref={campanaRef}>
            
            {/* BOTÓN DE LA CAMPANITA */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`relative p-3 rounded-2xl transition-all ${isOpen ? 'bg-teal-50 text-[#0F766E] shadow-inner' : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100 shadow-sm'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {alertas.length > 0 && (
                    <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                )}
            </button>
            
            {/* DROPDOWN */}
            {isOpen && (
              // 🌟 AQUÍ ESTÁ EL CAMBIO EXACTO QUE PEDISTE 🌟
              <div className="absolute top-[100%] left-0 right-0 mx-auto sm:mx-0 sm:left-auto sm:right-16 mt-2 w-[310px] sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                    <div className="bg-[#113130] p-4 flex justify-between items-center">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                            {view === 'alertas' ? 'Próximas Citas' : 'Configurar radar'}
                        </h3>
                        <button 
                            onClick={() => setView(view === 'alertas' ? 'configuracion' : 'alertas')}
                            className="text-teal-200 hover:text-white transition-colors"
                        >
                            {view === 'alertas' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37 1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35 1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                        </button>
                    </div>

                    {/* VISTA ALERTAS */}
                    {view === 'alertas' && (
                        <div className="max-h-80 overflow-y-auto bg-slate-50 p-2">
                            {alertas.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin Alarmas</p>
                                    <p className="text-[11px] text-slate-400 mt-1">No hay citas en las próximas {horasAnticipacion} horas.</p>
                                </div>
                            ) : (
                                alertas.map(alerta => (
                                    <div key={alerta.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 mb-2 border-l-4 border-l-rose-500">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs font-black text-[#113130] truncate">{alerta.patientName}</h4>
                                            <span className="text-[9px] font-black uppercase bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md">
                                                Faltan {alerta.timeLeft}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1">{alerta.date} a las {alerta.time}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* VISTA CONFIGURACIÓN */}
                    {view === 'configuracion' && (
                        <div className="p-4 bg-white space-y-2">
                            <p className="text-[11px] font-bold text-slate-400 text-center mb-2">Margen de anticipación:</p>
                            {[24, 48, 72].map(horas => (
                                <button 
                                    key={horas}
                                    onClick={() => cambiarConfiguracion(horas)}
                                    className={`w-full p-3 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex justify-between items-center ${horasAnticipacion === horas ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-100 text-slate-400'}`}
                                >
                                    {horas} Horas antes
                                    {horasAnticipacion === horas && <span className="text-xs">●</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CampanaAlertas;