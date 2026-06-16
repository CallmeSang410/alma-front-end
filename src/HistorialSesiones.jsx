import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Clock, XCircle, ChevronRight, FileEdit, CalendarDays, Video, MapPin, Loader2 } from 'lucide-react';
import api from './api'; // Importás tu instancia configurada

export default function HistorialSesiones({ pacienteId, onRedactarReporte,onVerReporte }) {
    const [sesiones, setSesiones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarHistorial = async () => {
            if (!pacienteId) return;
            
            setCargando(true);
            try {
                const token = localStorage.getItem('token');
                const res = await api.get(`/pacientes/${pacienteId}/historial-sesiones`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                // 🌟 MAGIA DE AXIOS: No hay .ok ni .json(). La data ya viene lista.
                setSesiones(res.data);
                
            } catch (error) {
                console.error("Error al cargar el historial:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarHistorial();
    }, [pacienteId]);

    // Helpers visuales
    const getModalidadIcon = (modalidad) => {
        if (modalidad?.toLowerCase() === 'virtual') return <Video size={12} className="inline mr-1" />;
        return <MapPin size={12} className="inline mr-1" />;
    };

    if (cargando) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-sm border border-slate-100">
                <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-400">Cargando expediente...</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 sm:p-8 animate-fade-in flex flex-col max-h-[360px]">
            
            {/* CABECERA (Esta se queda fija) */}
            <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                    <h2 className="text-xl font-black text-[#113130] flex items-center gap-2">
                        <CalendarDays className="text-[#0F766E]" size={24} />
                        Historial de Sesiones
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Línea de tiempo de citas y reportes clínicos del paciente.
                    </p>
                </div>
                <div className="bg-teal-50 text-[#0F766E] px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
                    {sesiones.length} Registros
                </div>
            </div>

            {sesiones.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-400 font-bold text-sm">Este paciente aún no tiene citas registradas.</p>
                </div>
            ) : (
                    <div className="flex-1 overflow-y-auto pr-4 pl-2 pb-6 custom-scrollbar">
                    <div className="relative border-l-2 border-slate-100 ml-6 sm:ml-8 space-y-8 pb-4 mt-2">
                        
                        {sesiones.map((cita) => {
                        const isPendiente = cita.estado === 'pendiente' || cita.estado === 'reservada';
                        const isCancelada = cita.estado === 'cancelada';
                        const isCompletadaSinReporte = cita.estado === 'completada' && !cita.tiene_reporte;
                        const isCompletadaConReporte = cita.estado === 'completada' && cita.tiene_reporte;

                        let dotColor = "bg-slate-200 border-white";
                        let icon = null;

                        if (isPendiente) {
                            dotColor = "bg-amber-400 border-amber-100 ring-amber-400/20";
                            icon = <Clock size={12} className="text-white" />;
                        } else if (isCancelada) {
                            dotColor = "bg-slate-300 border-slate-100";
                            icon = <XCircle size={12} className="text-white" />;
                        } else if (isCompletadaSinReporte) {
                            dotColor = "bg-rose-500 border-rose-100 ring-rose-500/30 animate-pulse";
                            icon = <AlertCircle size={12} className="text-white" />;
                        } else if (isCompletadaConReporte) {
                            dotColor = "bg-[#0F766E] border-teal-100 ring-teal-600/20";
                            icon = <FileText size={12} className="text-white" />;
                        }

                        return (
                            <div key={cita.cita_id} className="relative pl-8 group">
                                
                                <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-2 ring-4 flex items-center justify-center shadow-sm transition-all duration-300 ${dotColor}`}>
                                    {icon}
                                </div>

                                {/* 1. COMPLETADA SIN REPORTE (ALERTA ROJA) */}
                                {isCompletadaSinReporte && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                                            <div>
                                                <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest bg-rose-100 px-2.5 py-1 rounded-md mb-2 inline-block">
                                                    Acción Requerida
                                                </span>
                                                <h3 className="text-base font-black text-[#113130]">{cita.motivo}</h3>
                                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                                                    <span>📅 {cita.fecha} • {cita.hora}</span>
                                                    <span className="text-slate-400 font-medium">| {getModalidadIcon(cita.modalidad)} {cita.modalidad}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onRedactarReporte && onRedactarReporte(cita.cita_id)}
                                                className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
                                            >
                                                <FileEdit size={14} />
                                                Redactar Reporte
                                            </button>
                                        </div>
                                        <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
                                            <AlertCircle size={14} /> La sesión ya ocurrió pero el expediente está incompleto.
                                        </p>
                                    </div>
                                )}

                                {/* 2. COMPLETADA CON REPORTE IA (VERDE/TEAL) */}
                                {isCompletadaConReporte && (
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#0F766E]/30 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-base font-black text-[#113130]">{cita.motivo}</h3>
                                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                                                    <span>📅 {cita.fecha} • {cita.hora}</span>
                                                    <span className="text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-black">
                                                        Reporte IA Guardado
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                       <button 
                                            onClick={() => {
                                                console.log("Paso 1: Botón clickeado en Historial. Cita ID:", cita.cita_id);
                                                if (onVerReporte) onVerReporte(cita.cita_id);
                                                else console.warn("🚨 ERROR: onVerReporte no existe en HistorialSesiones");
                                            }}
                                            className="text-[#0F766E] hover:text-[#0D9488] text-xs font-black uppercase tracking-widest flex items-center gap-1 transition-colors mt-3"
                                        >
                                            Abrir Expediente Completo <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* 3. PENDIENTE / RESERVADA (AMARILLO SUTIL) */}
                                {isPendiente && (
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest bg-amber-100 px-2.5 py-1 rounded-md mb-2 inline-block">
                                                    Próxima Sesión
                                                </span>
                                                <h3 className="text-base font-black text-[#113130]">{cita.motivo}</h3>
                                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                                                    <span>📅 {cita.fecha} • {cita.hora}</span>
                                                    <span className="text-slate-400 font-medium">| {getModalidadIcon(cita.modalidad)} {cita.modalidad}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. CANCELADA (GRIS) */}
                                {isCancelada && (
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 opacity-75">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-sm font-bold text-slate-500 line-through decoration-slate-300">{cita.motivo}</h3>
                                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded-md">
                                                Cancelada
                                            </span>
                                        </div>
                                        <div className="text-xs font-medium text-slate-400 mt-1">
                                            📅 {cita.fecha} • {cita.hora}
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })}

                    <div className="absolute -left-[5px] bottom-0 w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    </div> 
                </div>      
            )}
        </div>
    );
}