import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Citas.css';
import { useAlerta, AlertaProvider } from './AlertaContext.jsx';

const Citas = () => {
    // 🛡️ ESCUDO ANTI-PANTALLA BLANCA:
    // Revisamos si el contexto existe antes de extraerlo. Si no existe, no explotamos.
    const contextoAlerta = useAlerta();
    
    const mostrarAlerta = contextoAlerta ? contextoAlerta.mostrarAlerta : (tipo, titulo, mensaje) => {
        console.error("⚠️ EL PROVIDER NO ESTÁ CONECTADO. Cayó en el fallback.");
        alert(`${titulo}: ${mensaje}`);
    };

    // ================= ESTADOS GENERALES =================
    const [view, setView] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todas');
    const [filterAtention, setFilterAtention] = useState('Todas');
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // ESTADOS DE BASE DE DATOS
    const [appointments, setAppointments] = useState([]);
    const [patientsList, setPatientsList] = useState([]); 

    // ESTADOS PARA CREACIÓN RÁPIDA DE PACIENES
    const [isNewPatient, setIsNewPatient] = useState(false);
    const [newPatientData, setNewPatientData] = useState({ nombre: '', telefono: '' });

    const [formData, setFormData] = useState({ 
        id: null, 
        paciente_id: '', 
        date: '', 
        time: '', 
        reason: '', 
        status: 'Pendiente',
        atention: 'Presencial' 
    });

    // Bloqueo de scroll para el modal
    useEffect(() => {
        if (appointmentToCancel) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [appointmentToCancel]);

    // ================= 🔌 CONEXIÓN CON FASTAPI =================
    const cargarDatos = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const resPacientes = await fetch('http://127.0.0.1:8000/pacientes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resCitas = await fetch('http://127.0.0.1:8000/citas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resPacientes.ok && resCitas.ok) {
                const pacientesDB = await resPacientes.json();
                const citasDB = await resCitas.json();

                setPatientsList(pacientesDB);

                const citasFormateadas = citasDB.map(cita => {
                    const paciente = pacientesDB.find(p => p.id === cita.paciente_id);
                    const [fecha, horaFull] = cita.fecha_cita.split('T');
                    const hora = horaFull ? horaFull.substring(0, 5) : "00:00";

                    return {
                        id: cita.id,
                        paciente_id: cita.paciente_id,
                        patientName: paciente ? paciente.nombre : "Paciente Eliminado/Desconocido",
                        patientPhone: paciente ? paciente.telefono : "",
                        date: fecha,
                        time: hora,
                        reason: cita.motivo,
                        status: cita.estado || "Pendiente",
                        atention: cita.atencion || "Presencial"
                    };
                });

                setAppointments(citasFormateadas);
            }
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // ================= FUNCIONES LÓGICAS =================
    const handleOpenForm = (appointment = null) => {
        setFormErrors({});
        setIsNewPatient(false);
        setNewPatientData({ nombre: '', telefono: '' });

        if (appointment) {
            setFormData(appointment);
        } else {
            const primerPacienteId = patientsList.length > 0 ? patientsList[0].id : '';
            setFormData({ 
                id: null, 
                paciente_id: primerPacienteId, 
                date: '', 
                time: '', 
                reason: '', 
                status: 'Pendiente',
                atention: 'Presencial' 
            });
        }
        setView('form');
    };

    const handleSaveAppointment = async (e) => {
        e.preventDefault();
        
        const errors = {};
        if (isNewPatient && !formData.id) {
            if (!newPatientData.nombre.trim()) errors.nuevoNombre = true;
        } else {
            if (!formData.paciente_id) errors.paciente_id = true;
        }

        if (!formData.date.trim()) errors.date = true;
        if (!formData.time.trim()) errors.time = true;
        if (!formData.reason.trim()) errors.reason = true;
        if (!formData.atention.trim()) errors.atention = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        try {
            const token = localStorage.getItem('token');
            let finalPacienteId = formData.paciente_id;

            if (isNewPatient && !formData.id) {
                console.log("Creando paciente express...");
                const resNuevoPaciente = await fetch('http://127.0.0.1:8000/pacientes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombre: newPatientData.nombre,
                        telefono: newPatientData.telefono,
                        estado: 'Pendiente',
                        atencion: 'Presencial'
                    })
                });

                if (resNuevoPaciente.ok) {
                    const pacienteCreado = await resNuevoPaciente.json();
                    finalPacienteId = pacienteCreado.id; 
                } else {
                    mostrarAlerta('error', 'Error', 'Error al crear el paciente rápido. Revisa la conexión.');
                    return; 
                }
            }

            const fechaCombinada = `${formData.date}T${formData.time}:00`;
            const datosParaCita = {
                motivo: formData.reason,
                fecha_cita: fechaCombinada,
                modalidad: formData.atention,
                estado: formData.status
            };

            let url = '';
            let method = '';

            if (formData.id) {
                url = `http://127.0.0.1:8000/citas/${formData.id}`;
                method = 'PUT';
            } else {
                url = `http://127.0.0.1:8000/pacientes/${finalPacienteId}/citas`;
                method = 'POST';
            }

            const respuesta = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosParaCita)
            });

            if (respuesta.ok) {
                window.dispatchEvent(new Event('actualizarRadarCitas'));
                cargarDatos(); 
                setView('list');
                mostrarAlerta('exito', '¡Guardado!', formData.id ? 'Cita modificada con éxito.' : 'Cita creada con éxito.');
            } else {
                mostrarAlerta('error', 'Error', 'Error al guardar la cita en la base de datos.');
            }
        } catch (error) {
            console.error("Error de red:", error);
            mostrarAlerta('error', 'Sin conexión', 'No se pudo conectar con el servidor.');
        }
    };

    const confirmCancelAppointment = async () => {
        try {
            const respuesta = await fetch(`http://127.0.0.1:8000/citas/${appointmentToCancel}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (respuesta.ok) {
                cargarDatos(); 
                setAppointmentToCancel(null);
                mostrarAlerta('exito', '¡Eliminada!', 'La cita se eliminó correctamente.');
            } else {
                mostrarAlerta('error', 'Error', 'No se pudo eliminar la cita.');
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            mostrarAlerta('error', 'Error', 'Ocurrió un error al intentar eliminar la cita.');
        }
    };

    const handleCompletarCita = async (citaId) => {
        console.log("¡Hicieron clic en el check! Intentando completar la cita ID:", citaId);
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`http://${window.location.hostname}:8000/citas/${citaId}/completar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                setAppointments(prevCitas => prevCitas.filter(cita => cita.id !== citaId));
                mostrarAlerta('exito', '¡Completada!', 'La cita se ha marcado como completada.');
            } else {
                mostrarAlerta('error', 'Error', 'No se pudo completar la cita.');
            }
        } catch (error) {
            console.error("Error al completar la cita:", error);
            mostrarAlerta('error', 'Error de Red', 'No pudimos conectar con el servidor.');
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        const matchesSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              appt.reason.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesFilter;
        if (filterStatus === 'Todas') {
            matchesFilter = appt.status.toLowerCase() !== 'completada'; 
        } else {
            matchesFilter = appt.status === filterStatus;
        }

        return matchesSearch && matchesFilter;
    });

    const getStatusStyles = (status) => {
        switch(status) {
            case 'Reservada': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Pendiente': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Cancelada': return 'bg-rose-50 text-rose-500 border-rose-200 line-through opacity-70';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const getAtentionStyles = (atention) => {
        switch(atention) {
            case 'A domicilio': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Presencial': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Virtual': return 'bg-amber-50 text-amber-600 border-amber-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const ErrorIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    );

    // ================= VISTA 1: LISTA Y FILTROS =================
    if (view === 'list') {
        return (
            <div className="space-y-6 relative animate-fade-in pb-10">
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

                        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 lg:pb-0 shrink-0">
                            {['Todas', 'Pendiente', 'Reservada', 'Cancelada'].map(status => (
                                <button 
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === status ? 'bg-[#113130] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 lg:pb-0 shrink-0">
                            {['Todas', 'A domicilio', 'Presencial', 'Virtual'].map(atention => (
                                <button 
                                    key={atention}
                                    onClick={() => setFilterAtention(atention)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterAtention === atention ? 'bg-[#113130] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                                >
                                    {atention}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

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
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${appt.status === 'Reservada' ? 'bg-emerald-400' : appt.status === 'Cancelada' ? 'bg-rose-400' : 'bg-amber-400'}`}></div>
                                
                                <div className="pl-2">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-black text-lg shadow-sm border border-teal-100">
                                                {appt.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-[#113130] leading-tight truncate max-w-[150px] sm:max-w-[200px]" title={appt.patientName}>{appt.patientName}</h3>
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
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleCompletarCita(appt.id)}
                                        className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-xl transition-colors flex items-center justify-center"
                                        title="Marcar como Completada"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                    </button>
                                    <button 
                                        onClick={() => setAppointmentToCancel(appt.id)} 
                                        className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors" 
                                        title="Eliminar Cita"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MODAL ORIGINAL DE CANCELAR CITA */}
                {appointmentToCancel && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                        <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setAppointmentToCancel(null)} />
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 shadow-2xl animate-fade-in border border-rose-100/50 text-center m-4">
                            <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-[#113130] mb-3">¿Eliminar Cita?</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">Esta acción borrará la cita de la base de datos permanentemente.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setAppointmentToCancel(null)} className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">Atrás</button>
                                <button onClick={confirmCancelAppointment} className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 transition-colors">Sí, Eliminar</button>
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
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-[#113130] tracking-tight">{formData.id ? 'Editar Cita' : 'Agendar Cita'}</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Completa los detalles para el calendario.</p>
                    </div>

                    <form onSubmit={handleSaveAppointment} className="space-y-6" noValidate>
                        
                        {/* 🌟 SWITCH PACIENTE NUEVO / EXISTENTE */}
                        {!formData.id && ( 
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                                <button type="button" onClick={() => { setIsNewPatient(false); setFormErrors({}); }} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${!isNewPatient ? 'bg-white text-[#113130] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Paciente Registrado
                                </button>
                                <button type="button" onClick={() => { setIsNewPatient(true); setFormErrors({}); }} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${isNewPatient ? 'bg-[#0F766E] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Paciente Nuevo
                                </button>
                            </div>
                        )}

                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
                            {!isNewPatient ? (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Seleccionar Paciente <span className="text-rose-500">*</span>
                                    </label>
                                    <select 
                                        value={formData.paciente_id} 
                                        onChange={(e) => setFormData({...formData, paciente_id: e.target.value})} 
                                        required
                                        disabled={formData.id !== null}
                                        className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.paciente_id ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-white border-slate-200 focus:ring-[#0F766E] border'}`} 
                                    >
                                        <option value="" disabled>Elige del directorio...</option>
                                        {patientsList.map(paciente => (
                                            <option key={paciente.id} value={paciente.id}>
                                                {paciente.nombre} {paciente.telefono ? `- Tel: ${paciente.telefono}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.paciente_id && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Debes seleccionar un paciente</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Completo <span className="text-rose-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={newPatientData.nombre} 
                                            onChange={(e) => setNewPatientData({...newPatientData, nombre: e.target.value})} 
                                            placeholder="Ej. Juan Pérez" 
                                            className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.nuevoNombre ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-white border-slate-200 focus:ring-[#0F766E] border'}`} 
                                        />
                                        {formErrors.nuevoNombre && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Nombre requerido</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teléfono (Opcional)</label>
                                        <input 
                                            type="tel" 
                                            value={newPatientData.telefono} 
                                            onChange={(e) => setNewPatientData({...newPatientData, telefono: e.target.value})} 
                                            placeholder="Ej. 8888 8888" 
                                            className="w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] border border-slate-200 transition-all bg-white" 
                                        />
                                    </div>
                                </div>
                            )}
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
                                {formErrors.date && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa una fecha</p>}
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
                                {formErrors.time && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa una hora</p>}
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
                                placeholder="Ej. Terapia inicial..." 
                                required
                                className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.reason ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                            />
                            {formErrors.reason && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Especifica el motivo</p>}
                        </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Modalidad <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    value={formData.atention} 
                                    onChange={(e) => setFormData({...formData, atention: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all"
                                >
                                    <option value="Presencial">Presencial</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="A domicilio">A domicilio</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Estado <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all"
                                >
                                    <option value="Pendiente">Pendiente (Por Confirmar)</option>
                                    <option value="Reservada">Reservada</option>
                                    <option value="Cancelada">Cancelada</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex gap-4">
                            <button type="submit" className="w-full bg-[#0F766E] hover:bg-[#0D9488] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 transition-colors">
                                {formData.id ? 'Guardar Cambios' : (isNewPatient ? 'Crear Paciente y Agendar Cita' : 'Agendar Cita')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    return null;
};

export default function CitasIntegrado() {
    return (
        <AlertaProvider>
            <Citas />
        </AlertaProvider>
    );
}