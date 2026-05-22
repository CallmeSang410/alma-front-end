import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Citas.css';

const Citas = () => {
    
    // ================= ESTADOS Y NAVEGACIÓN =================
    const [view, setView] = useState('list'); // 'list' | 'form'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todas'); // 'Todas', 'Confirmada', 'Pendiente', 'Cancelada'
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Bloqueo de scroll para el modal de cancelación
    useEffect(() => {
        if (appointmentToCancel) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [appointmentToCancel]);

    // ================= DATOS DE PRUEBA =================
    const [appointments, setAppointments] = useState([
        { id: 1, patientName: "Carlos Pérez", date: "2026-05-25", time: "10:30", reason: "Sesión de seguimiento TCC", urgency: "Normal", status: "Confirmada" },
        { id: 2, patientName: "Ana Lucía Mendieta", date: "2026-05-25", time: "14:00", reason: "Terapia de pareja (1ra sesión)", urgency: "Alta", status: "Pendiente" },
        { id: 3, patientName: "María José Castillo", date: "2026-05-26", time: "09:00", reason: "Evaluación post-alta", urgency: "Normal", status: "Confirmada" },
        { id: 4, patientName: "Roberto Sánchez", date: "2026-05-28", time: "16:15", reason: "Crisis de ansiedad", urgency: "Alta", status: "Cancelada" }
    ]);

    const [formData, setFormData] = useState({ id: null, patientName: '', date: '', time: '', reason: '', urgency: 'Normal', status: 'Pendiente' });

    // ================= FUNCIONES LÓGICAS =================
    const handleOpenForm = (appointment = null) => {
        setFormErrors({});
        if (appointment) {
            setFormData(appointment);
        } else {
            setFormData({ id: null, patientName: '', date: '', time: '', reason: '', urgency: 'Normal', status: 'Pendiente' });
        }
        setView('form');
    };

    const handleSaveAppointment = (e) => {
        e.preventDefault();
        
        // Validación Personalizada
        const errors = {};
        if (!formData.patientName.trim()) errors.patientName = true;
        if (!formData.date.trim()) errors.date = true;
        if (!formData.time.trim()) errors.time = true;
        if (!formData.reason.trim()) errors.reason = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        if (formData.id) {
            setAppointments(appointments.map(a => a.id === formData.id ? { ...a, ...formData } : a));
        } else {
            const newAppt = { ...formData, id: Date.now() };
            setAppointments([...appointments, newAppt]);
        }
        setView('list');
    };

    const confirmCancelAppointment = () => {
        setAppointments(appointments.map(a => a.id === appointmentToCancel ? { ...a, status: 'Cancelada' } : a));
        setAppointmentToCancel(null);
    };

    // ================= FILTRADO =================
    const filteredAppointments = appointments.filter(appt => {
        const matchesSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              appt.reason.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'Todas' || appt.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // ================= HELPERS VISUALES =================
    const getStatusStyles = (status) => {
        switch(status) {
            case 'Confirmada': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Pendiente': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Cancelada': return 'bg-rose-50 text-rose-500 border-rose-200 line-through opacity-70';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const getUrgencyIcon = (urgency) => {
        if (urgency === 'Alta') return <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Urgente</span>;
        return <span className="text-slate-400">Normal</span>;
    };

    const ErrorIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    );

    // ================= VISTA 1: LISTA Y FILTROS =================
    if (view === 'list') {
        return (
            <div className="space-y-6 relative animate-fade-in pb-10">
                {/* Cabecera y Controles */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-[#113130] tracking-tight">Agenda de Citas</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Organiza y filtra tus próximas consultas</p>
                        </div>
                        <button onClick={() => handleOpenForm()} className="bg-[#0F766E] hover:bg-[#0D9488] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/20 w-full sm:w-auto shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg> 
                            Nueva Cita
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-slate-50">
                        {/* Buscador */}
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Buscar por paciente o motivo..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all font-medium" 
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        {/* Píldoras de Filtro */}
                        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 lg:pb-0 shrink-0">
                            {['Todas', 'Pendiente', 'Confirmada', 'Cancelada'].map(status => (
                                <button 
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === status ? 'bg-[#113130] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid de Citas */}
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-[#113130]">No hay citas para mostrar</h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">No se encontraron resultados con los filtros actuales.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAppointments.map(appt => (
                            <div key={appt.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                                {/* Decorador lateral según estado */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${appt.status === 'Confirmada' ? 'bg-emerald-400' : appt.status === 'Cancelada' ? 'bg-rose-400' : 'bg-amber-400'}`}></div>
                                
                                <div className="pl-2">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-black text-lg shadow-sm border border-teal-100">
                                                {appt.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-[#113130] leading-tight truncate max-w-[150px] sm:max-w-[200px]">{appt.patientName}</h3>
                                                <div className="text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                                                    {getUrgencyIcon(appt.urgency)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${getStatusStyles(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{appt.reason}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {appt.date}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[#0F766E] font-black text-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {appt.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 pl-2">
                                    <button 
                                        onClick={() => handleOpenForm(appt)} 
                                        className="flex-1 bg-white border-2 border-slate-100 hover:border-teal-100 hover:bg-teal-50 text-slate-600 hover:text-[#0F766E] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        disabled={appt.status === 'Cancelada'}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => setAppointmentToCancel(appt.id)} 
                                        className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                                        title="Cancelar Cita"
                                        disabled={appt.status === 'Cancelada'}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MODAL CANCELAR CITA */}
                {appointmentToCancel && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                        <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setAppointmentToCancel(null)} />
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 shadow-2xl animate-fade-in border border-rose-100/50 text-center m-4">
                            <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-[#113130] mb-3">¿Cancelar Cita?</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">Esta acción marcará la cita como cancelada en el historial. Podrás reagendarla editándola más tarde si lo deseas.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setAppointmentToCancel(null)} className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">Atrás</button>
                                <button onClick={confirmCancelAppointment} className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 transition-colors">Sí, Cancelar</button>
                            </div>
                        </div>
                    </div>, document.body
                )}
            </div>
        );
    }

    // ================= VISTA 2: FORMULARIO =================
    if (view === 'form') {
        return (
            <div className="max-w-2xl mx-auto space-y-6 relative animate-fade-in pb-10">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors mb-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Cancelar
                </button>
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-[#113130] tracking-tight">{formData.id ? 'Editar Cita' : 'Agendar Cita'}</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Completa los detalles para el calendario.</p>
                    </div>
                    <form onSubmit={handleSaveAppointment} className="space-y-6" noValidate>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Paciente <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={formData.patientName} 
                                onChange={(e) => setFormData({...formData, patientName: e.target.value})} 
                                placeholder="Nombre del paciente..." 
                                required
                                className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.patientName ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                            />
                            {formErrors.patientName && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Este campo es obligatorio</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Fecha <span className="text-rose-500">*</span>
                            </label>
                                <input 
                                    type="date" 
                                    value={formData.date} 
                                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                    required
                                    className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.date ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                                />
                                {formErrors.date && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa una fecha válida</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Hora <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="time" 
                                    value={formData.time} 
                                    onChange={(e) => setFormData({...formData, time: e.target.value})} 
                                    required
                                    className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.time ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                                />
                                {formErrors.time && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa una hora válida</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Motivo de la cita <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={formData.reason} 
                                onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                                placeholder="Ej. Terapia inicial, Seguimiento..." 
                                required
                                className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.reason ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                            />
                            {formErrors.reason && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Este campo es obligatorio</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgencia</label>
                                <select 
                                    value={formData.urgency} 
                                    onChange={(e) => setFormData({...formData, urgency: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Alta">Alta (Urgente)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                                <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all"
                                >
                                    <option value="Pendiente">Pendiente (Por Confirmar)</option>
                                    <option value="Confirmada">Confirmada</option>
                                    <option value="Cancelada">Cancelada</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex gap-4">
                            <button type="submit" className="w-full bg-[#0F766E] hover:bg-[#0D9488] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 transition-colors">
                                {formData.id ? 'Guardar Cambios' : 'Agendar Cita'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default Citas;