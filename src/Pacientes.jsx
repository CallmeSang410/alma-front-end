import React, { useState, useEffect, createContext, useContext } from 'react';
import HistorialSesiones from './HistorialSesiones'; // Ajustá la ruta si lo guardaste en otra carpeta
import { createPortal } from 'react-dom';
import { useAlerta, AlertaProvider } from './AlertaContext.jsx'; // 🌟 1. IMPORTAMOS AMBAS COSAS



const SelectorPremium = ({ valor, opciones, alCambiar, placeholder, conError }) => {
    const [abierto, setAbierto] = useState(false);
    return (
        <div className="relative">
            {/* El "Botón" que muestra la opción elegida */}
            <div 
                onClick={() => setAbierto(!abierto)}
                className={`w-full rounded-2xl px-5 py-4 text-sm font-bold cursor-pointer flex justify-between items-center transition-all ${conError ? 'bg-rose-50 border-rose-400 text-rose-700 border' : 'bg-slate-50 border-slate-200 text-[#113130] hover:border-[#0F766E]/40 border'} ${abierto ? 'ring-2 ring-[#0F766E]/30 border-[#0F766E] bg-white' : ''}`}
            >
                <span className={!valor ? 'text-slate-400' : ''}>
                    {valor ? opciones.find(o => o.valor === valor)?.etiqueta : placeholder}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${abierto ? 'rotate-180 text-[#0F766E]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>

            {/* La lista desplegable flotante */}
            {abierto && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)}></div>
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                        {opciones.map((opt) => (
                            <div 
                                key={opt.valor}
                                onClick={() => { alCambiar(opt.valor); setAbierto(false); }}
                                className={`px-5 py-3.5 cursor-pointer text-sm font-bold transition-colors flex justify-between items-center ${valor === opt.valor ? 'bg-teal-50 text-[#0F766E]' : 'text-slate-500 hover:bg-slate-50 hover:text-[#113130]'}`}
                            >
                                {opt.etiqueta}
                                {valor === opt.valor && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
const Pacientes = ({ onNavigateToReportes }) => {
    // 🛡️ ESCUDO ANTI-PANTALLA BLANCA
    const contextoAlerta = useAlerta();
    const mostrarAlerta = contextoAlerta ? contextoAlerta.mostrarAlerta : (tipo, titulo, mensaje) => {
        console.warn("⚠️ ALERTA NATIVA NO DETECTADA: Revisa el AlertaProvider");
        alert(`${titulo}: ${mensaje}`);
    };

    const cssStyles = `
        .animate-fade-in { animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    `;

    const [view, setView] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [formErrors, setFormErrors] = useState({}); 
    const [formData, setFormData] = useState({ id: null, name: '', phone: '', email: '', age: '', status: 'Activo', sexo: '' });

    // 🌟 ESTADOS NUEVOS PARA CITAS Y REPORTES
    const [todasLasCitas, setTodasLasCitas] = useState([]);
    const [todosLosReportes, setTodosLosReportes] = useState([]);

    // ================= ESTADOS DE LA LÍNEA DE TIEMPO INTERACTIVA =================
    const [activeTimeline, setActiveTimeline] = useState('estado');
    const [isTimelineEditMode, setIsTimelineEditMode] = useState(false);
    
    // Modal para Notas
    const [selectedNote, setSelectedNote] = useState(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteStageId, setNoteStageId] = useState(null);
    
    // Modal para borrar toda la línea
    const [showDeleteTimelineModal, setShowDeleteTimelineModal] = useState(false);

    // 🌟 REEMPLAZO DE MOCK DATA POR DATOS REALES DE BASE DE DATOS
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [eventsToDelete, setEventsToDelete] = useState([]); // Rastrea los IDs eliminados en el frontend

    // Función para descargar los eventos desde FastAPI
    const cargarEventosPaciente = async (pacienteId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://127.0.0.1:8000/pacientes/${pacienteId}/eventos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTimelineEvents(data);
            }
        } catch (error) {
            console.error("Error al cargar eventos de la línea de tiempo:", error);
        }
    };

    // --- 🌟 FUNCIONES DE NOTAS (USANDO LAS NUEVAS COLUMNAS) ---
    const handleSaveNote = () => {
        setTimelineEvents(prev => prev.map(evt => {
            if (evt.id === noteStageId) {
                return {
                    ...evt,
                    // Guardamos directo en las variables oficiales
                    nota_titulo: selectedNote.titulo || '',
                    nota_contenido: selectedNote.contenido || ''
                };
            }
            return evt;
        }));
        setIsNoteModalOpen(false); 
    };

    const handleDeleteNote = (stageId) => {
        setTimelineEvents(prev => prev.map(evt => {
            if (evt.id === stageId) {
                // Vaciamos los campos nuevos
                return { ...evt, nota_titulo: '', nota_contenido: '' }; 
            }
            return evt;
        }));
        setIsNoteModalOpen(false);
    };

    const handleDeleteStage = (stageId) => {
        // Si el evento ya existía en la base de datos (ID numérico), lo anotamos para borrarlo en el backend
        if (typeof stageId === 'number') {
            setEventsToDelete(prev => [...prev, stageId]);
        }
        setTimelineEvents(prev => prev.filter(s => s.id !== stageId));
    };

    const handleAddStage = () => {
        setTimelineEvents(prev => [
            ...prev,
            // 🌟 Usamos titulo y fecha_evento para que FastAPI lo entienda
            { id: `temp-${Date.now()}`, fecha_evento: 'DD/MM', titulo: '', descripcion: '', impacto: activeTimeline }
        ]);
    };

    const handleChangeStage = (stageId, field, value) => {
        setTimelineEvents(prev => prev.map(s => s.id === stageId ? { ...s, [field]: value } : s));
    };

    // 🌟 GUARDADO MAESTRO EN LA BASE DE DATOS
    const toggleTimelineEditMode = async () => {
        if (isTimelineEditMode) {
            try {
                const token = localStorage.getItem('token');
                const headers = { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                };

                // 1. Borrar de la BD los nodos eliminados
                await Promise.all(eventsToDelete.map(id => 
                    fetch(`http://127.0.0.1:8000/eventos/${id}`, { method: 'DELETE', headers })
                ));
                setEventsToDelete([]);

                // 2. Guardar o actualizar los nodos actuales
                const eventosGuardados = await Promise.all(timelineEvents.map(async (evt) => {
                    const cuerpo = {
                        titulo: evt.titulo || 'Nueva Etapa',
                        fecha_evento: evt.fecha_evento || 'DD/MM',
                        descripcion: evt.descripcion || '', // Tu descripción original queda a salvo
                        impacto: evt.impacto,
                        nota_titulo: evt.nota_titulo || '',       // 🌟 ENVIAMOS EL NUEVO CAMPO
                        nota_contenido: evt.nota_contenido || ''  // 🌟 ENVIAMOS EL NUECO CAMPO
                    };

                    if (typeof evt.id === 'string' && evt.id.startsWith('temp-')) {
                        // Es un nodo nuevo creado en el frontend -> POST
                        const res = await fetch(`http://127.0.0.1:8000/pacientes/${selectedPatient.id}/eventos`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(cuerpo)
                        });
                        return res.json();
                    } else {
                        // Es un nodo viejo modificado -> PUT
                        const res = await fetch(`http://127.0.0.1:8000/eventos/${evt.id}`, {
                            method: 'PUT',
                            headers,
                            body: JSON.stringify(cuerpo)
                        });
                        return res.json();
                    }
                }));

                setTimelineEvents(eventosGuardados);
                mostrarAlerta('exito', '¡Guardado!', 'Línea de tiempo guardada en la base de datos exitosamente.'); // 🌟 REEMPLAZO
            } catch (error) {
                console.error(error);
                mostrarAlerta('error', 'Error', 'Error al sincronizar la línea de tiempo con el servidor.'); // 🌟 REEMPLAZO
            }
        }
        setIsTimelineEditMode(!isTimelineEditMode);
    };

    const clearTimeline = () => {
        const updatedTimelines = { ...mockTimelines };
        updatedTimelines[activeTimeline] = [];
        setMockTimelines(updatedTimelines);
        setShowDeleteTimelineModal(false);
    };

    const [patients, setPatients] = useState([]);

    // 🌟 NUEVA VERSIÓN DE CARGAR DATOS (Ahora trae TODO: Pacientes, Citas y Reportes)
    const obtenerDatosCompletos = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { 'Authorization': `Bearer ${token}` };

            const [resPacientes, resCitas, resReportes] = await Promise.all([
                fetch('http://127.0.0.1:8000/pacientes', { headers }),
                fetch('http://127.0.0.1:8000/citas', { headers }),
                fetch('http://127.0.0.1:8000/reportes', { headers })
            ]);

            // 🌟 CADA UNO SE CARGA POR SEPARADO PARA EVITAR APAGONES GLOBALES
            if (resPacientes.ok) {
                const datosPacientes = await resPacientes.json();
                const pacientesFormateados = datosPacientes.map(p => ({
                    id: p.id, 
                    name: p.nombre,
                    phone: p.telefono || 'Sin teléfono',
                    email: p.email || 'Sin correo',
                    age: p.edad,
                    status: p.estado || 'Activo',
                    sexo: p.sexo, 
                    timeline: [], 
                    reports: [] 
                }));
                setPatients(pacientesFormateados);
            } else {
                console.error("Error al cargar pacientes:", resPacientes.status);
            }

            if (resCitas.ok) {
                const datosCitas = await resCitas.json();
                setTodasLasCitas(datosCitas);
            }

            if (resReportes.ok) {
                const datosReportes = await resReportes.json();
                setTodosLosReportes(datosReportes);
            }

        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    useEffect(() => {
        obtenerDatosCompletos(); // Llamamos a la nueva función
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
                sexo: patient.sexo || '' 
            });
        } else {
            setFormData({ id: null, name: '', phone: '', email: '', age: '', status: 'Activo', sexo: '' }); 
        }
        setView('form');
    };

    const handleSavePatient = async (e) => {
        e.preventDefault();
        
        console.log("1. Botón de guardar presionado"); 

        const errors = {};
        if (!formData.name.trim()) errors.name = true;
        if (!formData.phone.trim()) errors.phone = true;
        if (!formData.age.toString().trim()) errors.age = true;

        if (Object.keys(errors).length > 0) {
            console.log("🛑 VALIDACIÓN FALLIDA. El formulario detuvo el envío por estos errores:", errors); 
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
            sexo: formData.sexo
        };
        
        console.log("✅ Validación exitosa. Enviando a FastAPI esta data:", datosParaBackend); 

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
                obtenerDatosCompletos(); // Recargamos todo después de guardar
                mostrarAlerta('exito', '¡Guardado!', formData.id ? "¡Expediente actualizado!" : "¡Expediente creado exitosamente!"); // 🌟 REEMPLAZO
                setView('list'); 
            } else {
                mostrarAlerta('error', 'Error', 'Hubo un error al guardar en la base de datos.'); // 🌟 REEMPLAZO
            }
        } catch (error) {
            mostrarAlerta('error', 'Sin Conexión', 'No se pudo conectar con el servidor.'); // 🌟 REEMPLAZO
        }
    };

    // 🌟 ================= FILTRO DE REPORTES PARA EL EXPEDIENTE =================
    let pacienteReportes = [];
    if (selectedPatient) {
        const citasDelPaciente = todasLasCitas.filter(cita => cita.paciente_id === selectedPatient.id);
        const idsCitasPaciente = citasDelPaciente.map(cita => cita.id);
        pacienteReportes = todosLosReportes.filter(reporte => idsCitasPaciente.includes(reporte.cita_id));
    }

    const handleDeletePatient = (id) => { setPatientToDelete(id); };

    const confirmDeletePatient = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                mostrarAlerta('error', 'Sesión Expirada', 'No tenés token de sesión. Volvé a loguearte.'); // 🌟 REEMPLAZO
                return;
            }

            const respuesta = await fetch(`http://127.0.0.1:8000/pacientes/${patientToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (respuesta.ok) {
                setPatients(patients.filter(p => p.id !== patientToDelete));
                setPatientToDelete(null);
                setSelectedPatient(null); 
                setView('list'); 
                mostrarAlerta('exito', '¡Eliminado!', '¡Expediente eliminado definitivamente!'); // 🌟 REEMPLAZO
            } else {
                const errorData = await respuesta.json();
                const mensajeError = errorData.detail || "Error desconocido en el servidor";
                mostrarAlerta('error', 'Error de FastAPI', `FastAPI rechazó el borrado: ${mensajeError}`); // 🌟 REEMPLAZO
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            mostrarAlerta('error', 'Sin Conexión', 'No se pudo conectar con el servidor para eliminar. ¿Está encendido FastAPI?'); // 🌟 REEMPLAZO
        }
    };

    const handleViewDetails = async (patient) => {
        setSelectedPatient(patient);
        setView('details');
        await cargarEventosPaciente(patient.id); 
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
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 sm:p-8 h-full flex flex-col justify-center">
                            <h3 className="text-xs font-black text-[#113130] uppercase tracking-widest mb-6">Info. Personal</h3>
                            <div className="space-y-6"> 
                                
                                {/* Teléfono */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Teléfono</p>
                                        <p className="text-base font-bold text-[#113130]">{selectedPatient.phone}</p> 
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                                        <p className="text-base font-bold text-[#113130] truncate">{selectedPatient.email}</p>
                                    </div>
                                </div>

                                {/* Edad */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Edad</p>
                                        <p className="text-base font-bold text-[#113130]">{selectedPatient.age} años</p>
                                    </div>
                                </div>

                                {/* Sexo */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sexo</p>
                                        <p className="text-base font-bold text-[#113130] capitalize">{selectedPatient.sexo || 'No especificado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lado Derecho: Historial de Sesiones */}
                        <div className="flex-1 flex flex-col">
                            <HistorialSesiones 
                                pacienteId={selectedPatient?.id} 
                                onRedactarReporte={(citaId) => {
                                    if (onNavigateToReportes) onNavigateToReportes(citaId);
                                }} 
                                onVerReporte={(citaId) => {
                                    console.log("Paso 2: Pacientes escuchó el clic. Cita:", citaId);
                                    if (onNavigateToReportes) {
                                        onNavigateToReportes(citaId);
                                    } else {
                                        console.warn("🚨 ERROR: Pacientes.jsx no recibió onNavigateToReportes desde Interface");
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* LÍNEA DE TIEMPO INTERACTIVA */}
                    <div className="bg-[#F8FAFA] rounded-[2rem] p-6 sm:p-10 shadow-inner border border-slate-200 overflow-hidden relative">
                        <div className="flex justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <h3 className="text-xl font-black text-[#113130] flex items-center gap-3">Historial Evolutivo</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">Línea de tiempo gráfica del progreso clínico</p>
                            </div>
                            
                            <button 
                                onClick={toggleTimelineEditMode} 
                                className={`p-3 rounded-2xl transition-all flex items-center gap-2 ${isTimelineEditMode ? 'bg-[#0F766E] text-white shadow-md' : 'bg-white text-slate-400 hover:text-[#0F766E] border border-slate-200'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">
                                    {isTimelineEditMode ? 'Guardar Cambios' : 'Modificar'}
                                </span>
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
                        
                        {timelineEvents.filter(e => e.impacto === activeTimeline).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-300">
                                <p className="text-sm font-bold text-slate-500 mb-4">No hay registros en esta línea de tiempo.</p>
                            </div>
                        ) : (
                            <div className="relative w-full overflow-x-auto py-10 px-4 md:px-10 custom-scrollbar flex items-center min-h-[350px]">
                                <div className={`absolute top-1/2 left-0 right-0 h-1.5 transform -translate-y-1/2 z-0 ${activeTimeline === 'estado' ? 'bg-gradient-to-r from-amber-100 via-amber-200 to-slate-200' : 'bg-gradient-to-r from-teal-100 via-teal-200 to-slate-200'}`}></div>
                                
                                <div className="flex items-center gap-10 md:gap-16 w-max min-w-full px-10 relative z-10">
                                {timelineEvents
                                    .filter(e => e.impacto === activeTimeline)
                                    .sort((a, b) => {
                                        // 🌟 FUNCIÓN NINJA: Convierte tu texto "DD/MM/YYYY" a números para ordenarlos
                                        const parseFecha = (str) => {
                                            if (!str) return 0;
                                            const partes = str.split('/');
                                            // Si el usuario puso Año (Ej. 04/04/2004)
                                            if (partes.length === 3) return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
                                            // Si el usuario solo puso Día/Mes (Ej. 04/10) - Asume un año base para ordenarlo
                                            if (partes.length === 2) return new Date(2000, partes[1] - 1, partes[0]).getTime();
                                            return 0; // Si dejó vacío o puso letras
                                        };
                                        // Ordenamos del más antiguo al más reciente
                                        return parseFecha(a.fecha_evento) - parseFecha(b.fecha_evento); 
                                    })
                                    .map((evt) => {
                                        const notaTitulo = evt.nota_titulo;
                                        const notaContenido = evt.nota_contenido;

                                        return (
                                            <div key={evt.id} className="relative flex flex-col items-center justify-center shrink-0 w-36 group h-[300px]">
                                                <div className="flex-1 w-full flex items-end justify-center pb-4 z-50">
                                                    {notaTitulo ? (
                                                        <button 
                                                            type="button"
                                                            onClick={() => { 
                                                                setSelectedNote({ id: evt.id, titulo: notaTitulo, contenido: notaContenido }); 
                                                                setNoteStageId(evt.id); 
                                                                setIsNoteModalOpen(true); 
                                                            }} 
                                                            className={`relative p-3.5 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest w-full truncate transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white border ${activeTimeline === 'estado' ? 'text-amber-700 border-amber-100 hover:border-amber-300' : 'text-teal-700 border-teal-100 hover:border-teal-300'}`}
                                                        >
                                                            <div className={`absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b bg-white transition-colors duration-300 ${activeTimeline === 'estado' ? 'border-amber-100 group-hover:border-amber-300' : 'border-teal-100 group-hover:border-teal-300'}`}></div>
                                                            <span className="block truncate">{notaTitulo}</span>
                                                        </button>
                                                    ) : isTimelineEditMode ? (
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { 
                                                                // 🌟 1. Evitamos que el clic se pierda o recargue cosas
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                
                                                                
                                                                // 🌟 3. Activamos tu estado
                                                                setSelectedNote({ titulo: '', contenido: '' }); 
                                                                setNoteStageId(evt.id); 
                                                                setIsNoteModalOpen(true); 
                                                            }} 
                                                            // 🌟 4. Le subimos el z-index a 100 para que nadie lo tape
                                                            className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-[#0F766E] shadow-lg hover:scale-110 transition-all cursor-pointer border-2 border-white relative z-[100]"
                                                        >
                                                            {/* El pointer-events-none evita que el clic le dé al SVG en lugar del botón */}
                                                            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                                        </button>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center opacity-50">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`shrink-0 w-8 h-8 rounded-full border-[6px] border-white shadow-md z-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${activeTimeline === 'estado' ? 'bg-amber-500 shadow-amber-500/40' : 'bg-[#0F766E] shadow-teal-700/40'}`}>
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>

                                                <div className="flex-1 w-48 flex flex-col justify-start pt-4 z-40 items-center text-center">
                                                    {isTimelineEditMode ? (
                                                        <div className="space-y-3 px-3 py-2 bg-white/90 rounded-xl backdrop-blur-md border border-slate-200 shadow-sm w-full">
                                                            <input 
                                                                type="text" 
                                                                value={evt.titulo || ''} 
                                                                onChange={(e) => handleChangeStage(evt.id, 'titulo', e.target.value)}
                                                                className="w-full text-xs font-black text-[#113130] text-center border-b-2 border-[#0F766E] focus:outline-none bg-transparent placeholder-slate-300"
                                                                placeholder="Etapa..."
                                                            />
                                                            <input 
                                                                type="text" 
                                                                value={evt.fecha_evento || ''} 
                                                                onChange={(e) => handleChangeStage(evt.id, 'fecha_evento', e.target.value)}
                                                                className="w-20 mx-auto text-[10px] font-black text-slate-500 text-center border-b border-slate-300 focus:outline-none focus:border-[#0F766E] bg-transparent uppercase placeholder-slate-300 block"
                                                                placeholder="DD/MM"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white/70 p-2 rounded-xl backdrop-blur-sm inline-block min-w-[80%]">
                                                            <h4 className="text-sm font-black text-[#113130] truncate px-1">{evt.titulo || 'Sin Título'}</h4>
                                                            <div className="mt-1.5">
                                                                <span className="text-[10px] font-black text-slate-500 bg-white px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block border border-slate-200 shadow-sm">
                                                                    {evt.fecha_evento || '--/--'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isTimelineEditMode && (
                                                        <div className="mt-4 flex gap-2">
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleDeleteStage(evt.id)} 
                                                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL DE ELIMINAR PACIENTE */}
                {patientToDelete && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setPatientToDelete(null)}></div>
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 text-center shadow-2xl border border-slate-100">
                            <h3 className="text-2xl font-black text-[#113130] mb-3">¿Eliminar Expediente?</h3>
                            <p className="text-sm text-slate-500 mb-8">Esta acción es permanente en HorizonFlow.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setPatientToDelete(null)} className="w-full py-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">Cancelar</button>
                                <button onClick={confirmDeletePatient} className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors shadow-md shadow-rose-900/20">Sí, Eliminar</button>
                            </div>
                        </div>
                    </div>, document.body
                )}

            {/* 🌟 AQUÍ PEGÁS EL MODAL DE LAS NOTAS PARA QUE REACT SÍ LO LEA */}
                {isNoteModalOpen && createPortal(
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#113130]/60 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)}></div>
                        
                        <div className="bg-white rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl p-6 md:p-8 animate-fade-in">
                            
                            {!isTimelineEditMode && selectedNote.titulo ? (
                                /* --- MODO LECTURA --- */
                                <div>
                                    <h3 className="text-xl font-black text-[#113130]">{selectedNote.titulo}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 mb-6">
                                        Fecha: {timelineEvents.find(s => s.id === noteStageId)?.fecha_evento || 'Desconocida'}
                                    </p>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedNote.contenido}</p>
                                    </div>
                                    <button onClick={() => setIsNoteModalOpen(false)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Cerrar Detalles</button>
                                </div>
                            ) : (
                                /* --- MODO EDICIÓN --- */
                                <div>
                                    <h3 className="text-xl font-black text-[#113130] mb-6">{selectedNote.titulo ? 'Modificar Nota' : 'Nueva Nota'}</h3>
                                    <div className="space-y-5">
                                        <input 
                                            type="text" 
                                            value={selectedNote.titulo || ''} 
                                            onChange={(e) => setSelectedNote({...selectedNote, titulo: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#113130] focus:outline-none focus:border-[#0F766E]" 
                                            placeholder="Título (Ej. Crisis de Pánico)" 
                                        />
                                        <textarea 
                                            value={selectedNote.contenido || ''} 
                                            onChange={(e) => setSelectedNote({...selectedNote, contenido: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 min-h-[120px] resize-none focus:outline-none focus:border-[#0F766E]" 
                                            placeholder="Detalles clínicos de la etapa..." 
                                        />
                                    </div>
                                    <div className="flex gap-3 mt-8">
                                        {selectedNote.titulo && (
                                            <button onClick={() => handleDeleteNote(noteStageId)} className="px-5 py-3.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-100 transition-colors">Eliminar</button>
                                        )}
                                        <button onClick={handleSaveNote} className="flex-1 py-3.5 bg-[#0F766E] text-white rounded-xl text-[10px] font-black uppercase hover:bg-[#0D9488] transition-colors shadow-md shadow-teal-900/20">Guardar Nota</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>, 
                    document.body
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
                                    className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.name ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                                />
                                {formErrors.name && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sexo <span className="text-rose-500">*</span></label>
                                {/* 🌟 APLICAMOS EL SELECTOR PREMIUM PARA SEXO */}
                                <SelectorPremium 
                                    valor={formData.sexo}
                                    opciones={[
                                        { valor: 'Masculino', etiqueta: 'Masculino' },
                                        { valor: 'Femenino', etiqueta: 'Femenino' }
                                    ]}
                                    alCambiar={(val) => setFormData({...formData, sexo: val})}
                                    placeholder="Seleccione..."
                                    conError={formErrors.sexo}
                                />
                                {formErrors.sexo && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teléfono <span className="text-rose-500">*</span></label>
                                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+505 8888 8888" className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} />
                                {formErrors.phone && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all hover:border-[#0F766E]/40" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edad <span className="text-rose-500">*</span></label>
                                <input type="number" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="Ej. 30" className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.age ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border hover:border-[#0F766E]/40'}`} />
                                {formErrors.age && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                                {/* 🌟 APLICAMOS EL SELECTOR PREMIUM PARA ESTADO */}
                                <SelectorPremium 
                                    valor={formData.status}
                                    opciones={[
                                        { valor: 'Activo', etiqueta: 'Activo (En tratamiento)' },
                                        { valor: 'Pendiente', etiqueta: 'Pendiente (Por evaluar)' },
                                        { valor: 'Alta', etiqueta: 'Alta (Tratamiento terminado)' }
                                    ]}
                                    alCambiar={(val) => setFormData({...formData, status: val})}
                                    placeholder="Seleccione estado..."
                                />
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
            {/* 🌟 MODAL DE NOTAS CLÍNICAS */}
          {/* ================= MODAL DE NOTAS DE LA LÍNEA DE TIEMPO ================= */}
            {isNoteModalOpen && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* La cortina oscura que cierra el modal al tocar afuera */}
                    <div 
                        className="absolute inset-0 bg-[#113130]/60 backdrop-blur-sm" 
                        onClick={() => setIsNoteModalOpen(false)}
                    ></div>
                    
                    <div className="bg-white rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl p-6 md:p-8 animate-fade-in">
                        
                        {/* MODO LECTURA */}
                        {!isTimelineEditMode && selectedNote.titulo ? (
                            <div>
                                <h3 className="text-xl font-black text-[#113130]">{selectedNote.titulo}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 mb-6">
                                    Fecha: {timelineEvents.find(s => s.id === noteStageId)?.fecha_evento || 'Desconocida'}
                                </p>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedNote.contenido}</p>
                                </div>
                                <button onClick={() => setIsNoteModalOpen(false)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Cerrar Detalles</button>
                            </div>
                        ) : (
                            /* MODO EDICIÓN */
                            <div>
                                <h3 className="text-xl font-black text-[#113130] mb-6">{selectedNote.titulo ? 'Modificar Nota' : 'Nueva Nota'}</h3>
                                <div className="space-y-5">
                                    <input 
                                        type="text" 
                                        value={selectedNote.titulo || ''} 
                                        onChange={(e) => setSelectedNote({...selectedNote, titulo: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#113130] focus:outline-none focus:border-[#0F766E]" 
                                        placeholder="Título (Ej. Crisis de Pánico)" 
                                    />
                                    <textarea 
                                        value={selectedNote.contenido || ''} 
                                        onChange={(e) => setSelectedNote({...selectedNote, contenido: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 min-h-[120px] resize-none focus:outline-none focus:border-[#0F766E]" 
                                        placeholder="Detalles clínicos de la etapa..." 
                                    />
                                </div>
                                <div className="flex gap-3 mt-8">
                                    {selectedNote.titulo && (
                                        <button onClick={() => handleDeleteNote(noteStageId)} className="px-5 py-3.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-100 transition-colors">Eliminar</button>
                                    )}
                                    <button onClick={handleSaveNote} className="flex-1 py-3.5 bg-[#0F766E] text-white rounded-xl text-[10px] font-black uppercase hover:bg-[#0D9488] transition-colors shadow-md shadow-teal-900/20">Guardar Nota</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>, 
                document.body
            )}
            
            {/* FALLBACK EN CASO DE ERROR DE VISTA */}
            {view !== 'list' && view !== 'details' && view !== 'form' && (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                     <h2 className="text-xl font-bold text-slate-500">Error: Vista no encontrada</h2>
                     <button onClick={() => setView('list')} className="mt-4 px-4 py-2 bg-[#0F766E] text-white rounded-lg">Volver al Inicio</button>
                </div>
            )}
        </>
    );
};

// 🌟 EXPORTACIÓN ENVUELTA EN EL PROVEEDOR (HACK ANTI-CHOQUES)
export default function PacientesIntegrado(props) {
    return (
        <AlertaProvider>
            <Pacientes {...props} />
        </AlertaProvider>
    );
}