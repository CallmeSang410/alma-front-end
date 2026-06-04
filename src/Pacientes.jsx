import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Pacientes = () => {
    const cssStyles = `
        .animate-fade-in { animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    `;

    const [view, setView] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [formErrors, setFormErrors] = useState({}); 
    const [formData, setFormData] = useState({ id: null, name: '', phone: '', email: '', age: '', status: 'Activo', sex: '' });

    // ================= ESTADOS DE LA LÍNEA DE TIEMPO INTERACTIVA =================
    const [activeTimeline, setActiveTimeline] = useState('estado');
    const [isTimelineEditMode, setIsTimelineEditMode] = useState(false);
    
    // Modal para Notas
    const [selectedNote, setSelectedNote] = useState(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteStageId, setNoteStageId] = useState(null);
    
    // Modal para borrar toda la línea
    const [showDeleteTimelineModal, setShowDeleteTimelineModal] = useState(false);

    // DATOS DE EJEMPLO FUNCIONALES (Mock Data)
    const [mockTimelines, setMockTimelines] = useState({
        estado: [
            { id: 'est-1', date: '10 May', title: 'Inicio de Síntomas', notes: [{ id: 'n1', title: 'Dolor Agudo', content: 'Paciente reporta dolor punzante en la zona lumbar (8/10).' }] },
            { id: 'est-2', date: '25 May', title: 'Crisis Intermedia', notes: [] },
            { id: 'est-3', date: '10 Jun', title: 'Estabilización', notes: [{ id: 'n2', title: 'Mejora leve', content: 'El dolor se ha reducido a 4/10 tras primera fase de descanso.' }] }
        ],
        terapia: [
            { id: 'ter-1', date: '15 May', title: 'Evaluación Inicial', notes: [{ id: 'n3', title: 'Plan Físico', content: 'Se planifican 10 sesiones de termoterapia.' }] },
            { id: 'ter-2', date: '01 Jun', title: 'Sesión 5 - Ajuste', notes: [{ id: 'n4', title: 'Buena respuesta', content: 'Aumento del rango de movilidad en un 30%.' }] },
            { id: 'ter-3', date: '15 Jun', title: 'Reevaluación', notes: [] }
        ]
    });

    // --- FUNCIONES DE LA LÍNEA DE TIEMPO ---
    const handleSaveNote = () => {
        const updatedTimelines = { ...mockTimelines };
        const stageIndex = updatedTimelines[activeTimeline].findIndex(s => s.id === noteStageId);
        
        if (stageIndex !== -1) {
            if (selectedNote.id) {
                const noteIndex = updatedTimelines[activeTimeline][stageIndex].notes.findIndex(n => n.id === selectedNote.id);
                updatedTimelines[activeTimeline][stageIndex].notes[noteIndex] = selectedNote;
            } else {
                updatedTimelines[activeTimeline][stageIndex].notes.push({ ...selectedNote, id: `new-${Date.now()}` });
            }
            setMockTimelines(updatedTimelines);
        }
        setIsNoteModalOpen(false);
    };

    const handleDeleteNote = (stageId, noteId) => {
        const updatedTimelines = { ...mockTimelines };
        const stageIndex = updatedTimelines[activeTimeline].findIndex(s => s.id === stageId);
        updatedTimelines[activeTimeline][stageIndex].notes = updatedTimelines[activeTimeline][stageIndex].notes.filter(n => n.id !== noteId);
        setMockTimelines(updatedTimelines);
        setIsNoteModalOpen(false);
    };

    const handleDeleteStage = (stageId) => {
        const updatedTimelines = { ...mockTimelines };
        updatedTimelines[activeTimeline] = updatedTimelines[activeTimeline].filter(s => s.id !== stageId);
        setMockTimelines(updatedTimelines);
    };

    const handleAddStage = () => {
        const updatedTimelines = { ...mockTimelines };
        updatedTimelines[activeTimeline].push({
            id: `stage-${Date.now()}`,
            date: 'Nueva Fecha',
            title: 'Nueva Etapa',
            notes: []
        });
        setMockTimelines(updatedTimelines);
    };

    const clearTimeline = () => {
        const updatedTimelines = { ...mockTimelines };
        updatedTimelines[activeTimeline] = [];
        setMockTimelines(updatedTimelines);
        setShowDeleteTimelineModal(false);
    };

    const [patients, setPatients] = useState([]);

    const obtenerPacientes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("No se encontró ningún token de acceso.");
                return;
            }

            const respuesta = await fetch('http://127.0.0.1:8000/pacientes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (respuesta.ok) {
                const datosServidor = await respuesta.json();
                const pacientesFormateados = datosServidor.map(p => ({
                    id: p.id, 
                    name: p.nombre,
                    phone: p.telefono || 'Sin teléfono',
                    email: p.email || 'Sin correo',
                    age: p.edad,
                    status: p.estado || 'Activo',
                    timeline: [], 
                    reports: [] 
                }));
                setPatients(pacientesFormateados);
            } else {
                console.error("El guardia del backend rechazó el acceso a la lista.");
            }
        } catch (error) {
            console.error("Error al conectar con el endpoint de lectura:", error);
        }
    };

    useEffect(() => {
        obtenerPacientes();
    }, []);

    useEffect(() => {
        if (patientToDelete) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [patientToDelete]);

    const handleOpenForm = (patient = null) => {
        setFormErrors({});
        if (patient) {
            setFormData({
                id: patient.id,
                name: patient.name,
                phone: patient.phone === 'Sin teléfono' ? '' : patient.phone,
                email: patient.email === 'Sin correo' ? '' : patient.email,
                age: patient.age || '',
                status: patient.status || 'Activo',
                sex: patient.sex || '' 
            });
        } else {
            setFormData({ id: null, name: '', phone: '', email: '', age: '', status: 'Activo', sex: '' }); 
        }
        setView('form');
    };

    const handleSavePatient = async (e) => {
        e.preventDefault();
        
        const errors = {};
        if (!formData.name.trim()) errors.name = true;
        if (!formData.phone.trim()) errors.phone = true;
        if (!formData.age.toString().trim()) errors.age = true;
        if (!formData.sex.trim()) errors.sex = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        const datosParaBackend = {
            nombre: formData.name,
            telefono: formData.phone,
            email: formData.email, 
            edad: formData.age ? parseInt(formData.age) : null, 
            estado: formData.status,
            sexo: formData.sex
        };

        try {
            const url = 'http://127.0.0.1:8000/pacientes';
            const metodoHTTP = formData.id ? 'PUT' : 'POST';
            const urlFinal = formData.id ? `${url}/${formData.id}` : url;

            const respuesta = await fetch(urlFinal, {
                method: metodoHTTP,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify(datosParaBackend)
            });

            if (respuesta.ok) {
                obtenerPacientes();
                alert(formData.id ? "¡Expediente actualizado!" : "¡Expediente creado exitosamente!");
                setView('list'); 
            } else {
                alert("Hubo un error al guardar. Revisa la consola.");
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor.");
        }
    };

    const handleDeletePatient = (id) => { setPatientToDelete(id); };
const confirmDeletePatient = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No tenés token de sesión. Volvé a loguearte.");
                return;
            }

            // 🌟 Usamos 'localhost' para mantener consistencia con tus otros endpoints
            const respuesta = await fetch(`http://127.0.0.1:8000/pacientes/${patientToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Enseñamos el gafete
                }
            });

            if (respuesta.ok) {
                // Si FastAPI dice OK, lo borramos de la pantalla
                setPatients(patients.filter(p => p.id !== patientToDelete));
                setPatientToDelete(null);
                setSelectedPatient(null); // Por si estabas dentro del expediente
                setView('list'); 
                alert("¡Expediente eliminado definitivamente!");
            } else {
                const errorData = await respuesta.json();
                // 🕵️‍♂️ Esto te va a decir exactamente por qué el backend no quiere borrarlo:
                const mensajeError = errorData.detail || "Error desconocido en el servidor";
                alert(`FastAPI rechazó el borrado: ${mensajeError}`);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor para eliminar. ¿Está encendido FastAPI?");
        }
    };

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
        setView('details');
    };

    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const getTrendInfo = (status) => {
        if (status === 'Activo') return { label: 'Tendencia Positiva', gradient: 'from-emerald-400 via-teal-400 to-slate-200', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'border-emerald-400', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' };
        if (status === 'Pendiente') return { label: 'Tendencia Estable', gradient: 'from-amber-400 via-orange-300 to-slate-200', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'border-amber-400', icon: 'M5 12h14' };
        return { label: 'Alta Exitosa', gradient: 'from-[#0F766E] via-teal-400 to-slate-200', text: 'text-[#0F766E]', bg: 'bg-teal-50', border: 'border-teal-200', ring: 'border-teal-400', icon: 'M5 13l4 4L19 7' };
    };

    const ErrorIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    );

    // ================= VISTA 1: DIRECTORIO =================
    if (view === 'list') {
        return (
            <div className="space-y-6 relative animate-fade-in pb-10">
                <style>{cssStyles}</style>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black text-[#113130] tracking-tight">Directorio de Pacientes</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input type="text" placeholder="Buscar por nombre o diagnóstico..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all font-medium" />
                            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <button onClick={() => handleOpenForm()} className="bg-[#0F766E] hover:bg-[#0D9488] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/20 w-full sm:w-auto">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg> Nuevo
                        </button>
                    </div>
                </div>

                {filteredPatients.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-[#113130]">No se encontraron pacientes</h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Intenta con otros términos de búsqueda o agrega uno nuevo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPatients.map(patient => (
                            <div key={patient.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 text-[#0F766E] flex items-center justify-center font-black text-xl border border-teal-100 shadow-sm">{patient.name.charAt(0)}</div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${patient.status === 'Activo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : patient.status === 'Pendiente' ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 'bg-slate-50 text-slate-500 border border-slate-200/50'}`}>{patient.status}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-[#113130] leading-tight truncate">{patient.name}</h3>
                                    
                                    <div className="mt-6 space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                        <div className="flex items-center gap-3 text-slate-600 text-xs font-bold"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{patient.phone}</div>
                                        <div className="flex items-center gap-3 text-slate-600 text-xs font-bold truncate"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span className="truncate">{patient.email}</span></div>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button onClick={() => handleViewDetails(patient)} className="flex-1 bg-white border-2 border-slate-100 hover:border-teal-100 hover:bg-teal-50 text-slate-600 hover:text-[#0F766E] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Expediente</button>
                                    <button onClick={() => handleOpenForm(patient)} className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-[#113130] rounded-xl transition-colors" title="Editar Info"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            {/* MODAL DE ELIMINAR: PEGAR JUSTO ANTES DEL ÚLTIMO </div> DE LA VISTA */}
                {patientToDelete && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setPatientToDelete(null)}></div>
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 text-center">
                            <h3 className="text-2xl font-black text-[#113130] mb-3">¿Eliminar Expediente?</h3>
                            <p className="text-sm text-slate-500 mb-8">Esta acción es permanente en HorizonFlow.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setPatientToDelete(null)} className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest">Cancelar</button>
                                <button onClick={confirmDeletePatient} className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">Sí, Eliminar</button>
                            </div>
                        </div>
                    </div>, document.body
                )}
            </div>
        );
    }

    // ================= VISTA 2: DETALLE DEL EXPEDIENTE =================
    if (view === 'details' && selectedPatient) {
        return (
            <div className="space-y-6 relative animate-fade-in pb-10">
                <style>{cssStyles}</style>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors mb-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 w-fit hover:shadow-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Directorio</button>

                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full md:w-auto">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#0F766E] to-teal-500 text-white flex items-center justify-center font-black text-4xl shadow-xl shadow-teal-900/20 shrink-0 border-4 border-white">{selectedPatient.name.charAt(0)}</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-4 flex-wrap mb-2"><h1 className="text-3xl sm:text-4xl font-black text-[#113130] tracking-tight">{selectedPatient.name}</h1><span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${selectedPatient.status === 'Activo' ? 'bg-emerald-50 text-emerald-600' : selectedPatient.status === 'Pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{selectedPatient.status}</span></div>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto relative z-10 shrink-0">
                        <button onClick={() => handleOpenForm(selectedPatient)} className="flex-1 md:flex-none bg-slate-50 hover:bg-slate-100 text-[#113130] px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Editar Perfil</button>
                        <button onClick={() => handleDeletePatient(selectedPatient.id)} className="flex-1 md:flex-none bg-white border-2 border-rose-100 hover:bg-rose-50 text-rose-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Eliminar</button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 h-full">
                            <h3 className="text-sm font-black text-[#113130] uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Info. Personal</h3>
                            <div className="space-y-5">
                                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Teléfono</p><p className="text-sm font-bold text-[#113130]">{selectedPatient.phone}</p></div></div>
                                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div><div className="overflow-hidden"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email</p><p className="text-sm font-bold text-[#113130] truncate">{selectedPatient.email}</p></div></div>
                                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Edad</p><p className="text-sm font-bold text-[#113130]">{selectedPatient.age} años</p></div></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 h-full">
                            <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-4">
                                <h3 className="text-sm font-black text-[#113130] uppercase tracking-widest">Reportes IA</h3>
                            </div>
                            {selectedPatient.reports && selectedPatient.reports.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedPatient.reports.map(report => (
                                        <div key={report.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors cursor-pointer group">
                                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                                            <div className="flex-1 overflow-hidden"><h4 className="text-sm font-bold text-[#113130] truncate">{report.title}</h4></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-xs text-slate-500 font-bold">Sin reportes generados.</p></div>)}
                        </div>
                    </div>

                    {/* LÍNEA DE TIEMPO INTERACTIVA */}
                    <div className="bg-[#F8FAFA] rounded-[2rem] p-6 sm:p-10 shadow-inner border border-slate-200 overflow-hidden relative">
                        <div className="flex justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <h3 className="text-xl font-black text-[#113130] flex items-center gap-3">Historial Evolutivo</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">Línea de tiempo gráfica del progreso clínico</p>
                            </div>
                            <button onClick={() => setIsTimelineEditMode(!isTimelineEditMode)} className={`p-3 rounded-2xl transition-all flex items-center gap-2 ${isTimelineEditMode ? 'bg-[#0F766E] text-white' : 'bg-white text-slate-400 hover:text-[#0F766E]'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">{isTimelineEditMode ? 'Guardar Cambios' : 'Modificar'}</span>
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 border-b border-slate-200/60 pb-8">
                            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 shrink-0 overflow-x-auto hide-scrollbar">
                                <button onClick={() => setActiveTimeline('estado')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTimeline === 'estado' ? 'bg-[#0F766E] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Estado del Padecimiento</button>
                                <button onClick={() => setActiveTimeline('terapia')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTimeline === 'terapia' ? 'bg-[#0F766E] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Avance de Terapia</button>
                            </div>
                            {isTimelineEditMode && (
                                <button onClick={handleAddStage} className="bg-white border-2 border-[#0F766E] text-[#0F766E] hover:bg-teal-50 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg> Agregar Evento
                                </button>
                            )}
                        </div>
                        {mockTimelines[activeTimeline].length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-300">
                                <p className="text-sm font-bold text-slate-500 mb-4">No hay registros en esta línea de tiempo.</p>
                            </div>
                        ) : (
                            <div className="relative w-full overflow-x-auto pb-16 pt-32 px-4 md:px-10 hide-scrollbar flex items-center min-h-[350px]">
                                <div className="absolute top-[60%] left-0 right-0 h-2 bg-slate-200/80 rounded-full z-0"></div>
                                <div className="flex items-center gap-20 md:gap-32 w-max min-w-full">
                                    {mockTimelines[activeTimeline].map((stage) => (
                                        <div key={stage.id} className="relative z-10 flex flex-col items-center shrink-0 w-32 group">
                                            <div className="absolute bottom-[calc(100%+30px)] flex flex-col-reverse gap-2 w-full items-center">
                                                {stage.notes.map(note => (
                                                    <button key={note.id} onClick={() => { setSelectedNote(note); setNoteStageId(stage.id); setIsNoteModalOpen(true); }} className={`p-3 rounded-xl shadow-md text-[9px] font-black uppercase tracking-widest w-32 truncate transition-transform hover:-translate-y-1 border-2 bg-white ${activeTimeline === 'estado' ? 'text-amber-700 border-amber-300 hover:border-amber-400' : 'text-emerald-700 border-emerald-300 hover:border-emerald-400'}`}>{note.title}</button>
                                                ))}
                                                {isTimelineEditMode && (
                                                    <button onClick={() => { setNoteStageId(stage.id); setSelectedNote({ title: '', content: '' }); setIsNoteModalOpen(true); }} className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 shadow-lg hover:scale-110 transition-transform mb-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
                                                )}
                                            </div>
                                            {stage.notes.length > 0 && <div className="absolute bottom-[calc(100%+15px)] h-4 w-0.5 bg-slate-300"></div>}
                                            <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md z-20 ${activeTimeline === 'estado' ? 'bg-amber-500' : 'bg-[#0F766E]'}`}></div>
                                            <div className="mt-6 text-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100 w-36">
                                                <h4 className="text-xs font-black text-[#113130] truncate">{stage.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{stage.date}</p>
                                            </div>
                                            {isTimelineEditMode && (
                                                <div className="absolute top-[calc(100%+70px)] flex gap-2">
                                                    <button onClick={() => handleDeleteStage(stage.id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* MODAL DE ELIMINAR: PEGAR JUSTO ANTES DEL ÚLTIMO </div> DE LA VISTA */}
                {patientToDelete && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setPatientToDelete(null)}></div>
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 text-center">
                            <h3 className="text-2xl font-black text-[#113130] mb-3">¿Eliminar Expediente?</h3>
                            <p className="text-sm text-slate-500 mb-8">Esta acción es permanente en HorizonFlow.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setPatientToDelete(null)} className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest">Cancelar</button>
                                <button onClick={confirmDeletePatient} className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">Sí, Eliminar</button>
                            </div>
                        </div>
                    </div>, document.body
                )}
            </div>
        );
    }

    // ================= VISTA 3: FORMULARIO =================
    if (view === 'form') { 
        return (
            <div className="max-w-2xl mx-auto space-y-6 relative animate-fade-in pb-10">
                <style>{cssStyles}</style>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors mb-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Cancelar y Volver
                </button>
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-[#113130] tracking-tight">{formData.id ? 'Editar Expediente' : 'Nuevo Paciente'}</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Completa la información básica para el directorio clínico.</p>
                    </div>
                    <form onSubmit={handleSavePatient} className="space-y-6" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Completo <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    placeholder="Ej. Juan Pérez..." 
                                    className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.name ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                                />
                                {formErrors.name && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sexo <span className="text-rose-500">*</span></label>
                                <select 
                                    value={formData.sex} 
                                    onChange={(e) => setFormData({...formData, sex: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                                {formErrors.sex && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teléfono <span className="text-rose-500">*</span></label>
                                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+505 8888 8888" className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} />
                                {formErrors.phone && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edad <span className="text-rose-500">*</span></label>
                                <input type="number" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="Ej. 30" className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.age ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} />
                                {formErrors.age && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all">
                                    <option value="Activo">Activo (En tratamiento)</option>
                                    <option value="Pendiente">Pendiente (Por evaluar)</option>
                                    <option value="Alta">Alta (Tratamiento terminado)</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-100 flex gap-4">
                            <button type="submit" className="w-full bg-[#0F766E] hover:bg-[#0D9488] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 transition-colors">
                                {formData.id ? 'Guardar Cambios' : 'Crear Expediente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // ================= FALLBACK Y MODALES GLOBALES =================
    return (
        <>
            {isNoteModalOpen && selectedNote && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#113130]/60 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative z-10 shadow-2xl animate-fade-in border border-slate-100">
                        <button onClick={() => setIsNoteModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {!isTimelineEditMode && selectedNote.id ? (
                            <div>
                                <h3 className="text-xl font-black text-[#113130]">{selectedNote.title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 mb-6">
                                    Fecha: {mockTimelines[activeTimeline].find(s => s.id === noteStageId)?.date || 'Desconocida'}
                                </p>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedNote.content}</p>
                                </div>
                                <button onClick={() => setIsNoteModalOpen(false)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Cerrar Detalles</button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-black text-[#113130] mb-6">{selectedNote.id ? 'Modificar Nota' : 'Nueva Nota'}</h3>
                                <div className="space-y-5">
                                    <input type="text" value={selectedNote.title} onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#113130]" placeholder="Título" />
                                    <textarea value={selectedNote.content} onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 min-h-[120px] resize-none" placeholder="Detalles..." />
                                </div>
                                <div className="flex gap-3 mt-8">
                                    {selectedNote.id && <button onClick={() => handleDeleteNote(noteStageId, selectedNote.id)} className="px-5 py-3.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase">Eliminar</button>}
                                    <button onClick={handleSaveNote} className="flex-1 py-3.5 bg-[#0F766E] text-white rounded-xl text-[10px] font-black uppercase">Guardar Cambios</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>, document.body
            )}
            
            {patientToDelete && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setPatientToDelete(null)}></div>
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 text-center">
                        <h3 className="text-2xl font-black text-[#113130] mb-3">¿Eliminar Expediente?</h3>
                        <p className="text-sm text-slate-500 mb-8">Esta acción es permanente.</p>
                        <div className="flex gap-3"><button onClick={() => setPatientToDelete(null)} className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase">Cancelar</button><button onClick={confirmDeletePatient} className="w-full py-3.5 bg-rose-500 text-white rounded-xl text-[11px] font-black uppercase">Sí, Eliminar</button></div>
                    </div>
                </div>, document.body
            )}

            {view !== 'list' && view !== 'details' && view !== 'form' && (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                     <h2 className="text-xl font-bold text-slate-500">Error: Vista no encontrada</h2>
                     <button onClick={() => setView('list')} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">Volver al Inicio</button>
                </div>
            )}
        </>
    );
};

export default Pacientes;