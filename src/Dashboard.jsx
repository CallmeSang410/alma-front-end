import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
    // Datos de prueba para las tarjetas y la agenda
    const stats = [
        { 
            title: "Pacientes Activos", 
            value: "142", 
            trend: "+12% este mes", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, 
            color: "text-[#0D9488]", 
            bg: "bg-teal-50" 
        },
        { 
            title: "Citas Hoy", 
            value: "8", 
            trend: "3 confirmadas", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, 
            color: "text-blue-600", 
            bg: "bg-blue-50" 
        },
        { 
            title: "Análisis IA Pendientes", 
            value: "3", 
            trend: "Requieren revisión", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
            color: "text-amber-600", 
            bg: "bg-amber-50" 
        }
    ];

    const upcomingAppointments = [
        { id: 1, name: "Ana Lucía Mendieta", time: "09:00 AM", type: "Terapia Cognitiva", status: "En espera" },
        { id: 2, name: "Carlos Pérez", time: "10:30 AM", type: "Evaluación Inicial", status: "Confirmada" },
        { id: 3, name: "María José Castillo", time: "01:00 PM", type: "Seguimiento", status: "Por confirmar" },
        { id: 4, name: "Roberto Sánchez", time: "03:00 PM", type: "Terapia de Pareja", status: "Confirmada" }
    ];

    // Datos para la distribución de satisfacción (Escala de 1 a 5)
    const ratingDistribution = [
        { stars: 5, percentage: 78, color: "bg-[#0D9488]" },
        { stars: 4, percentage: 15, color: "bg-teal-400" },
        { stars: 3, percentage: 5,  color: "bg-amber-400" },
        { stars: 2, percentage: 2,  color: "bg-orange-400" },
        { stars: 1, percentage: 0,  color: "bg-rose-500" }
    ];

    return (
        <div className="space-y-6 relative animate-fade-in pb-20"> {/* Añadí pb-20 para dar espacio al botón flotante */}
            
            {/* Cabecera del Dashboard */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#113130] tracking-tight">Bienvenido, Dr. Administrador</h1>
                    <p className="text-slate-500 text-sm mt-1">Aquí tienes un resumen de tu práctica clínica hoy.</p>
                </div>
            </div>

            {/* Tarjetas de Estadísticas (Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-black text-[#113130]">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <p className={`text-xs font-semibold mt-4 ${stat.trend.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {stat.trend}
                        </p>
                    </div>
                ))}
            </div>

            {/* SEGUNDA FILA: Agenda (Izquierda) + Satisfacción Global (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Agenda */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-[#113130]">Próximas Citas</h2>
                        <a href="#" className="text-xs font-bold text-[#0F766E] hover:text-[#0D9488] transition-colors">Ver todas</a>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {upcomingAppointments.map((apt) => (
                            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors group gap-3 sm:gap-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#0F766E] group-hover:bg-teal-100 transition-colors">
                                        {apt.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#113130]">{apt.name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{apt.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 sm:justify-end">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#113130]">{apt.time}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${apt.status === 'Confirmada' ? 'text-emerald-600' : apt.status === 'En espera' ? 'text-amber-500' : 'text-slate-400'}`}>
                                            {apt.status}
                                        </p>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-[#0F766E] hover:bg-teal-50 rounded-lg transition-colors hidden sm:block">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Satisfacción Global */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col">
                    <h2 className="text-lg font-black text-[#113130] w-full text-left mb-1">Satisfacción Global</h2>
                    <p className="text-xs text-slate-500 font-medium w-full text-left mb-6">Escala basada en evaluaciones post-sesión</p>

                    {/* Promedio General */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-5xl font-black text-[#113130] tracking-tighter">4.8</span>
                        <div className="flex flex-col">
                            <div className="flex text-amber-400">
                                {[...Array(4)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                    <defs>
                                        <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="50%" stopColor="currentColor" />
                                            <stop offset="50%" stopColor="#cbd5e1" />
                                        </linearGradient>
                                    </defs>
                                    <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">de 5 (128 reseñas)</span>
                        </div>
                    </div>

                    {/* Barras de Desglose de Porcentajes */}
                    <div className="space-y-2.5 w-full flex-1 mt-2">
                        {ratingDistribution.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 w-8 shrink-0 text-slate-600 font-bold justify-end">
                                    <span>{item.stars}</span>
                                    <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                </div>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                                </div>
                                <span className="w-8 text-right text-slate-500 font-bold">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TERCERA FILA: Asistente IA */}
            <div className="bg-gradient-to-r from-[#0F766E] to-[#0b5c56] rounded-2xl shadow-md p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-teal-500/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                        <svg className="w-6 h-6 text-teal-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-wide">Asistente IA Clínico</h2>
                        <p className="text-teal-100 text-sm font-medium mt-1 leading-relaxed max-w-xl">
                            He analizado las notas de tus últimas 3 sesiones. Hay patrones de mejora significativos en el paciente <span className="font-bold text-white">Carlos Pérez</span>.
                        </p>
                    </div>
                </div>
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                    <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl text-sm font-bold transition-colors">
                        Generar Resumen
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white text-[#0F766E] hover:bg-teal-50 px-5 py-3 rounded-xl text-sm font-black shadow-lg transition-colors">
                        Redactar Pre-Diagnóstico
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;