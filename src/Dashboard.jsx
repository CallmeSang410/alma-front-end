import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    
    // ================= EFECTO PARA BLOQUEAR EL SCROLL =================
    useEffect(() => {
        if (isTaskModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isTaskModalOpen]);

    // ================= ESTADOS PARA LAS TAREAS =================
    const [todoTasks, setTodoTasks] = useState([
        { id: 1, title: "Revisar informe clínico de Carlos P.", category: "Clínico", urgency: "Alta", checked: false },
        { id: 2, title: "Preparar material didáctico", category: "Terapia", urgency: "Media", checked: false },
        { id: 3, title: "Actualizar notas de sesión de María", category: "Expediente", urgency: "Baja", checked: true },
        { id: 4, title: "Enviar liga de Zoom a Roberto S.", category: "Administración", urgency: "Alta", checked: false }
    ]);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('Clínico');
    const [newTaskUrgency, setNewTaskUrgency] = useState('Baja');

    const handleAddTask = (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            title: newTaskTitle,
            category: newTaskCategory,
            urgency: newTaskUrgency,
            checked: false
        };
        setTodoTasks([newTask, ...todoTasks]);
        setIsTaskModalOpen(false);
        setNewTaskTitle('');
        setNewTaskCategory('Clínico');
        setNewTaskUrgency('Baja');
    };

    const toggleTask = (taskId) => {
        setTodoTasks(todoTasks.map(task => 
            task.id === taskId ? { ...task, checked: !task.checked } : task
        ));
    };

    // ================= DATOS DE LAS TARJETAS (PULIDOS) =================
    const stats = [
        { 
            title: "Pacientes Activos", 
            value: "142", 
            trend: "+12% este mes",
            trendColor: "text-[#0D9488]", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, 
            color: "text-[#0D9488]", 
            bg: "bg-teal-50", 
            hasSparkline: true 
        },
        { 
            title: "Citas Hoy", 
            value: "8", 
            trend: "3 confirmadas",
            trendColor: "text-slate-400 font-medium", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, 
            color: "text-blue-600", 
            bg: "bg-blue-50/50",
            actionButton: "Revisar Citas" // <-- NUEVO BOTÓN
        },
        { 
            title: "Análisis IA Pendientes", 
            value: "3", 
            trend: "Alta prioridad",
            trendColor: "text-rose-500", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
            color: "text-amber-600", 
            bg: "bg-amber-50", 
            actionButton: "Revisar Ahora" 
        }
    ];

    const recentActivities = [
        { id: 1, action: "Resumen IA generado", subject: "Paciente: Carlos Pérez", time: "Hace 15 min", color: "text-amber-600", bg: "bg-amber-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
        { id: 2, action: "Nueva cita agendada", subject: "Primera sesión", time: "Hace 1 hora", color: "text-blue-600", bg: "bg-blue-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { id: 3, action: "Evaluación completada", subject: "Paciente: Ana Lucía M.", time: "Hace 3 horas", color: "text-[#0D9488]", bg: "bg-teal-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> }
    ];

    const keyPatients = [
        { id: 1, name: "Carlos Pérez", alert: "Alerta: Patrón de insomnio severo", status: "Requiere Atención", color: "text-rose-600", bg: "bg-rose-50" },
        { id: 2, name: "Ana Lucía Mendieta", alert: "Firma de notas pendiente", status: "Administrativo", color: "text-amber-600", bg: "bg-amber-50" }
    ];

    const ratingDistribution = [
        { stars: 5, percentage: 78, color: "bg-[#0D9488]" },
        { stars: 4, percentage: 15, color: "bg-teal-400" },
        { stars: 3, percentage: 5,  color: "bg-amber-400" },
        { stars: 2, percentage: 2,  color: "bg-orange-400" },
        { stars: 1, percentage: 0,  color: "bg-rose-500" }
    ];

    return (
        <>
            <div className="space-y-6 relative animate-fade-in pb-10">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#113130] tracking-tight">Bienvenido, Dr. Administrador</h1>
                        <p className="text-slate-500 text-sm mt-1">Aquí tienes un resumen de tu práctica clínica hoy.</p>
                    </div>
                </div>

                {/* ================= ESTADÍSTICAS MEJORADAS ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                            
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">{stat.title}</p>
                                    <h3 className="text-4xl font-black text-[#113130]">{stat.value}</h3>
                                </div>
                                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                            
                            <div className="mt-2 flex flex-col justify-end flex-1">
                                {/* Sparkline Ajustado: Más estético, sin estirar las otras tarjetas */}
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
                                
                                <p className={`text-xs ${stat.trendColor} mt-auto`}>
                                    {stat.trend}
                                </p>

                                {/* Botón de acción dinámico */}
                                {stat.actionButton && (
                                    <button className={`mt-4 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                                        ${stat.title === "Citas Hoy" ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200' : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200'}
                                    `}>
                                        {stat.actionButton}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= ACTIVIDADES RECIENTES ================= */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-black text-[#113130]">Actividades Recientes</h2>
                        <a href="#" className="text-xs font-bold text-[#0F766E] hover:text-[#0D9488] transition-colors">Ver historial</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className={`p-2.5 rounded-lg ${activity.bg} ${activity.color} shrink-0`}>
                                    {activity.icon}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#113130] leading-tight">{activity.action}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{activity.subject}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= SECCIÓN APILADA ================= */}
                <div className="flex flex-col gap-6">
                    
                    {/* Pacientes Clave */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-black text-[#113130]">Pacientes Clave</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Alertas y seguimiento inteligente</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {keyPatients.map((patient) => (
                                <div key={patient.id} className="flex flex-col sm:flex-row sm:items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-teal-100 transition-colors gap-4">
                                    <div className="flex items-start sm:items-center gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-[#0F766E] shrink-0 shadow-sm">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                <h4 className="text-sm font-bold text-[#113130]">{patient.name}</h4>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded w-fit ${patient.bg} ${patient.color}`}>
                                                    {patient.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">{patient.alert}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                                        <button className="flex-1 sm:flex-none py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-lg transition-colors">
                                            Ver Detalle
                                        </button>
                                        <button className="flex-1 sm:flex-none py-2 px-4 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                            Iniciar Nota
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tareas de Hoy */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-black text-[#113130]">Tareas de Hoy</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Gestión clínica y administrativa</p>
                            </div>
                            <button 
                                onClick={() => setIsTaskModalOpen(true)}
                                className="w-10 h-10 rounded-full bg-teal-50 text-[#0F766E] hover:bg-[#0F766E] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                title="Añadir nueva tarea"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {todoTasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-xs hover:shadow-sm transition-all">
                                    <div className="pt-0.5">
                                        <input 
                                            type="checkbox" 
                                            checked={task.checked}
                                            onChange={() => toggleTask(task.id)}
                                            className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] border-slate-300 cursor-pointer accent-[#0F766E]" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-bold leading-snug ${task.checked ? 'line-through text-slate-400' : 'text-[#113130]'}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                                {task.category}
                                            </span>
                                            {/* URGENCIA SIEMPRE VISIBLE */}
                                            <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                task.urgency === 'Alta' ? 'bg-rose-50 text-rose-500' :
                                                task.urgency === 'Media' ? 'bg-amber-50 text-amber-500' :
                                                'bg-emerald-50 text-emerald-500'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    task.urgency === 'Alta' ? 'bg-rose-500 animate-pulse' :
                                                    task.urgency === 'Media' ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                                }`}></span>
                                                {task.urgency}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Satisfacción Global */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col md:flex-row items-center gap-8">
                        <div className="text-center md:text-left w-full md:w-auto shrink-0">
                            <h2 className="text-lg font-black text-[#113130]">Satisfacción Global</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1 mb-4">Evaluaciones post-sesión</p>
                            
                            <div className="inline-flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <span className="text-5xl font-black text-[#113130] tracking-tighter">4.8</span>
                                <div className="flex flex-col">
                                    <div className="flex text-amber-400 mb-1">
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
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">de 5 (128 reseñas)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-3">
                            {ratingDistribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-xs">
                                    <span className="w-4 font-bold text-[#113130]">{item.stars}★</span>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                                    </div>
                                    <span className="w-8 text-right text-slate-500 font-bold">{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Asistente IA */}
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

            {/* ================= MODAL DE TAREAS (PORTAL PARA CENTRADO PERFECTO) ================= */}
            {isTaskModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen">
                    <div 
                        className="absolute inset-0 bg-[#113130]/60 backdrop-blur-sm"
                        onClick={() => setIsTaskModalOpen(false)}
                    />
                    
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 relative z-10 shadow-2xl animate-fade-in border border-teal-100/30 m-4">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-[#113130]">Nueva Tarea</h3>
                                <p className="text-xs text-slate-500 mt-1">Añade un pendiente a tu día</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleAddTask}>
                            <div>
                                <label className="block text-xs font-bold text-[#113130] uppercase tracking-wider mb-2">Descripción de la Tarea</label>
                                <input 
                                    type="text" 
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Ej: Revisar expediente de Ana..." 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#113130] uppercase tracking-wider mb-2">Índole</label>
                                    <div className="relative">
                                        <select 
                                            value={newTaskCategory}
                                            onChange={(e) => setNewTaskCategory(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] appearance-none text-slate-700 font-medium"
                                        >
                                            <option value="Clínico">Clínico</option>
                                            <option value="Expediente">Expediente</option>
                                            <option value="Administración">Administrativo</option>
                                            <option value="Terapia">Terapia</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#113130] uppercase tracking-wider mb-2">Urgencia</label>
                                    <div className="relative">
                                        <select 
                                            value={newTaskUrgency}
                                            onChange={(e) => setNewTaskUrgency(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] appearance-none text-slate-700 font-medium"
                                        >
                                            <option value="Baja">🟢 Baja</option>
                                            <option value="Media">🟡 Media</option>
                                            <option value="Alta">🔴 Alta (Urgente)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsTaskModalOpen(false)}
                                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-teal-600/30 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default Dashboard;