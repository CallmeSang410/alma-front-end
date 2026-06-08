import React, { useState } from 'react';
import { Clock, FileText, DollarSign, UserCheck, UserPlus, FileWarning, CalendarX, PieChart, X, CheckCircle2 } from 'lucide-react';

// ================= DATOS SIMULADOS =================
const CITAS_HOY = [
    { id: 1, hora: '08:00 AM', paciente: 'Ana Martínez', tipo: 'Evaluación Inicial', estado: 'completada', duracion: '60 min' },
    { id: 2, hora: '10:30 AM', paciente: 'Carlos Ruiz', tipo: 'Terapia Cognitiva', estado: 'en_curso', duracion: '45 min' },
    { id: 3, hora: '01:00 PM', paciente: 'Elena Gómez', tipo: 'Seguimiento', estado: 'pendiente', duracion: '30 min' },
    { id: 4, hora: '03:15 PM', paciente: 'Luis Rodríguez', tipo: 'Terapia de Pareja', estado: 'pendiente', duracion: '90 min' },
    { id: 5, hora: '05:00 PM', paciente: 'Sofía Castro', tipo: 'Evaluación', estado: 'pendiente', duracion: '60 min' }
];

const INITIAL_PACIENTES_INACTIVOS = [
    { id: 1, name: 'Marcos Ramírez', ultimaCita: 'Hace 35 días', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 2, name: 'Laura Gómez', ultimaCita: 'Hace 42 días', color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 3, name: 'Roberto Sánchez', ultimaCita: 'Hace 60 días', color: 'text-slate-500', bg: 'bg-slate-100' },
    { id: 4, name: 'Diana Herrera', ultimaCita: 'Hace 45 días', color: 'text-amber-600', bg: 'bg-amber-50' }
];

const MOTIVOS_CONSULTA = [
    { motivo: 'Ansiedad Generalizada', porcentaje: 40, color: 'bg-emerald-500' },
    { motivo: 'Terapia de Pareja', porcentaje: 25, color: 'bg-teal-400' },
    { motivo: 'Depresión', porcentaje: 20, color: 'bg-blue-400' },
    { motivo: 'Gestión del Estrés', porcentaje: 15, color: 'bg-indigo-400' }
];

const Dashboard = () => {
    // Estado para poder ocultar las alertas de pacientes inactivos
    const [pacientesInactivos, setPacientesInactivos] = useState(INITIAL_PACIENTES_INACTIVOS);

    // Función para descartar/ocultar el aviso
    const descartarAviso = (id) => {
        setPacientesInactivos(prev => prev.filter(paciente => paciente.id !== id));
    };

    // ================= KPIs CLÍNICOS =================
    const clinicaStats = [
        { 
            title: "Pacientes Activos", 
            value: "142", 
            trend: "+12% este mes",
            trendColor: "text-[#0D9488]", 
            icon: <UserCheck className="w-6 h-6" strokeWidth={2} />, 
            color: "text-[#0D9488]", 
            bg: "bg-teal-50", 
            hasSparkline: true 
        },
        { 
            title: "Expedientes por Actualizar", 
            value: "3", 
            trend: "Más de 24h sin notas clínicas",
            trendColor: "text-rose-500 font-bold", 
            icon: <FileWarning className="w-6 h-6" strokeWidth={2} />, 
            color: "text-rose-600", 
            bg: "bg-rose-50",
            actionButton: "Redactar Reportes Ahora",
            isAlert: true
        }
    ];

    // ================= SALUD DEL CONSULTORIO (Negocio) =================
    const businessStats = [
        { title: "Ingresos Estimados (Mes)", value: "$3,450", trend: "+15% vs mes anterior", icon: <DollarSign size={20}/>, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Tasa de Retención", value: "82%", trend: "Agendaron 2da sesión", icon: <UserCheck size={20}/>, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Nuevos Pacientes", value: "12", trend: "Expedientes abiertos este mes", icon: <UserPlus size={20}/>, color: "text-indigo-600", bg: "bg-indigo-50" }
    ];

    return (
        <>
            <div className="space-y-8 relative animate-fade-in pb-10">
                
                {/* CABECERA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#113130] tracking-tight">Bienvenido, Dr. Administrador</h1>
                        <p className="text-slate-500 text-sm mt-1">Resumen de tu jornada clínica y estado del consultorio.</p>
                    </div>
                </div>

                {/* ================= KPIs CLÍNICOS (Top) ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {clinicaStats.map((stat, index) => (
                        <div key={index} className={`p-6 rounded-[1.5rem] shadow-sm border transition-shadow flex flex-col justify-between h-full ${stat.isAlert ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-100 hover:shadow-md'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${stat.isAlert ? 'text-rose-600' : 'text-slate-500'}`}>{stat.title}</p>
                                    <h3 className="text-4xl font-black text-[#113130]">{stat.value}</h3>
                                </div>
                                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                            
                            <div className="mt-2 flex flex-col justify-end flex-1">
                                {stat.hasSparkline && (
                                    <div className="w-full h-12 mt-2 mb-3 relative overflow-hidden">
                                        <svg viewBox="0 0 100 30" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0.01" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,25 C20,25 30,18 50,18 C70,18 85,5 100,5 L100,30 L0,30 Z" fill="url(#fillGrad)" />
                                            <path d="M0,25 C20,25 30,18 50,18 C70,18 85,5 100,5" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                                
                                <p className={`text-xs mt-auto ${stat.trendColor}`}>{stat.trend}</p>

                                {stat.actionButton && (
                                    <button className={`mt-4 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20`}>
                                        {stat.actionButton}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= SALUD DEL CONSULTORIO (Métricas de Negocio) ================= */}
                <div className="bg-[#113130] rounded-3xl p-6 sm:p-8 shadow-md">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-white">Salud del Consultorio</h2>
                        <p className="text-xs text-teal-200/70 font-medium mt-1">Métricas financieras y de crecimiento del mes actual.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {businessStats.map((biz, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/15 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${biz.bg} ${biz.color}`}>
                                        {biz.icon}
                                    </div>
                                    <span className="text-white text-2xl font-black">{biz.value}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-teal-100 uppercase tracking-wider">{biz.title}</p>
                                    <p className="text-xs text-teal-200/60 mt-1 font-medium">{biz.trend}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= LÍNEA DE TIEMPO HORIZONTAL DE CITAS ================= */}
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-black text-[#113130]">Agenda del Día</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">Línea de tiempo de tus citas confirmadas.</p>
                        </div>
                    </div>
                    
                    <div className="relative w-full overflow-x-auto pb-6 scrollbar-thin">
                        <div className="flex min-w-max gap-8 px-2 pt-2 relative">
                            {/* Línea horizontal central */}
                            <div className="absolute top-[12px] left-0 right-0 h-[2px] bg-slate-100 z-0"></div>

                            {CITAS_HOY.map((cita) => {
                                const isCompletada = cita.estado === 'completada';
                                const isEnCurso = cita.estado === 'en_curso';
                                const colorDot = isCompletada ? 'bg-emerald-500 border-emerald-500' : isEnCurso ? 'bg-amber-400 border-amber-400 animate-pulse' : 'bg-slate-300 border-slate-300';
                                const cardBg = isEnCurso ? 'bg-teal-50/50 border-[#0F766E]/20' : 'bg-white border-slate-100 hover:border-slate-300';

                                return (
                                    <div key={cita.id} className="relative z-10 w-64 flex flex-col gap-4 group">
                                        {/* Punto y Hora */}
                                        <div className="flex items-center gap-3 bg-white pr-3 w-fit">
                                            <div className={`w-5 h-5 rounded-full border-4 ring-4 ring-white transition-colors duration-300 ${colorDot}`}></div>
                                            <span className={`text-sm font-black transition-colors ${isEnCurso ? 'text-[#0F766E]' : 'text-slate-600 group-hover:text-[#113130]'}`}>{cita.hora}</span>
                                        </div>
                                        
                                        {/* Tarjeta */}
                                        <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-xs group-hover:shadow-sm ${cardBg}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-[#113130] text-sm truncate pr-2">{cita.paciente}</h4>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                                                    isCompletada ? 'bg-emerald-100 text-emerald-700' : 
                                                    isEnCurso ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {cita.estado.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><FileText size={13}/> {cita.tipo}</p>
                                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Clock size={13}/> {cita.duracion}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ================= DOS COLUMNAS: MOTIVOS DE CONSULTA Y ALERTAS INACTIVOS ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* COLUMNA IZQ: MOTIVOS DE CONSULTA */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-black text-[#113130] flex items-center gap-2">
                                    <PieChart className="text-[#0F766E]" size={20} />
                                    Distribución de Motivos
                                </h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Diagnósticos principales del mes actual.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {MOTIVOS_CONSULTA.map((item, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="flex justify-between text-sm font-bold mb-1.5">
                                        <span className="text-slate-600 group-hover:text-[#113130] transition-colors">{item.motivo}</span>
                                        <span className="text-[#113130]">{item.porcentaje}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                                            style={{ width: `${item.porcentaje}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COLUMNA DER: PACIENTES INACTIVOS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-black text-[#113130] flex items-center gap-2">
                                    <CalendarX className="text-rose-500" size={20} />
                                    Alertas de Inactividad
                                </h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Pacientes con más de 30 días sin agendar.</p>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                                {pacientesInactivos.length} Alertas
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            {pacientesInactivos.length > 0 ? (
                                pacientesInactivos.map((patient) => (
                                    <div key={patient.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div>
                                            <h4 className="text-sm font-bold text-[#113130] leading-tight">{patient.name}</h4>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 inline-block px-2 py-0.5 rounded-md ${patient.color} ${patient.bg}`}>
                                                Última cita: {patient.ultimaCita}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => descartarAviso(patient.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Descartar aviso"
                                        >
                                            <X size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
                                    <p className="text-sm font-bold">¡Todo al día!</p>
                                    <p className="text-xs">No hay pacientes en riesgo de inactividad.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div> 
            
            <style>{`
                .animate-fade-in { animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .scrollbar-thin::-webkit-scrollbar { height: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            `}</style>
        </>
    );
};

export default Dashboard;