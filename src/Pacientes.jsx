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

    useEffect(() => {
        if (patientToDelete) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [patientToDelete]);

    const [patients, setPatients] = useState([
        { 
            id: 1, name: "Carlos Pérez", phone: "+505 8888 7777", email: "carlos.perez@email.com", age: 34, condition: "Trastorno de Ansiedad Generalizada", status: "Activo", 
            timeline: [
                { id: 101, date: "20 May 2026", type: "Sesión", title: "TCC - Avance en control de pánico", note: "El paciente reporta una reducción del 40% en la frecuencia de los ataques de pánico nocturnos. Se practicaron técnicas de exposición imaginada con buenos resultados de tolerancia emocional. Tarea: Diario de pensamientos.", tags: ["Ansiedad: 5/10", "Mejoría notable", "TCC"] }, 
                { id: 102, date: "05 May 2026", type: "Evaluación", title: "Aplicación de Escala GAD-7", note: "Se aplicó el instrumento psicométrico GAD-7 resultando en una puntuación de 14 (Ansiedad Moderada). Se estructuró el plan de tratamiento cognitivo-conductual a 12 semanas con objetivos claros.", tags: ["GAD-7: 14", "Plan de 12 semanas"] }, 
                { id: 103, date: "25 Abr 2026", type: "Ingreso", title: "Entrevista Clínica Inicial", note: "Paciente varón de 34 años. Refiere insomnio de conciliación crónico y rumiación constante asociada a altos niveles de estrés laboral. Se establecieron las expectativas del proceso terapéutico.", tags: ["Insomnio", "Estrés Laboral", "Motivo de Consulta"] }
            ], 
            reports: [
                { id: 201, date: "15 May 2026", title: "Reporte Evolutivo - Mayo", size: "1.2 MB" }, 
                { id: 202, date: "25 Abr 2026", title: "Evaluación Inicial GAD-7", size: "850 KB" }
            ] 
        },
        { id: 2, name: "Ana Lucía Mendieta", phone: "+505 7777 6666", email: "ana.mendieta@email.com", age: 28, condition: "Terapia de Pareja", status: "Pendiente", timeline: [{ id: 104, date: "18 May 2026", type: "Sesión", title: "Dinámica de Comunicación", note: "Primera sesión conjunta. Se detectaron patrones de comunicación defensiva. Se recomienda firmar acuerdo de asistencia mutua para asegurar el compromiso de ambas partes.", tags: ["Comunicación", "Firma Pendiente"] }], reports: [] },
        { id: 3, name: "María José Castillo", phone: "+505 8123 4567", email: "mj.castillo@email.com", age: 42, condition: "Depresión Leve", status: "Alta", timeline: [{ id: 105, date: "10 Mar 2026", type: "Alta", title: "Alta Clínica y Cierre", note: "La paciente cumple con todos los objetivos terapéuticos trazados hace 6 meses. Estabilidad emocional sostenida y reintegración social exitosa. Se da alta médica con seguimiento semestral preventivo.", tags: ["Alta Médica", "Objetivos Cumplidos", "Seguimiento"] }], reports: [{ id: 203, date: "10 Mar 2026", title: "Resumen de Alta Médica", size: "2.1 MB" }] }
    ]);

    const [formData, setFormData] = useState({ id: null, name: '', phone: '', email: '', age: '', condition: '', status: 'Activo' });

    const handleOpenForm = (patient = null) => {
        setFormErrors({});
        if (patient) setFormData(patient); 
        else setFormData({ id: null, name: '', phone: '', email: '', age: '', condition: '', status: 'Activo' }); 
        setView('form');
    };

const handleSavePatient = async (e) => { // ¡Añadimos async aquí!
        e.preventDefault();
        
        // --- 1. Validación original de Dervin (dejamos esto igual) ---
        const errors = {};
        if (!formData.name.trim()) errors.name = true;
        if (!formData.phone.trim()) errors.phone = true;
        if (!formData.age.toString().trim()) errors.age = true;
        if (!formData.condition.trim()) errors.condition = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        // --- 2. EMPAQUETAMOS LOS DATOS PARA FASTAPI ---
        // Los nombres de la izquierda DEBEN ser idénticos a los de tu schemas.py
        const datosParaBackend = {
            nombre: formData.name,
            telefono: formData.phone,
            email: formData.email, // Puede ir vacío
            edad: parseInt(formData.age), // ¡Clave! FastAPI pide un Integer
            estado: formData.status,
            diagnostico_principal: formData.condition
        };

        try {
            // --- 3. ENVIAMOS EL PAQUETE AL MESERO (FASTAPI) ---
            const url = 'http://localhost:8000/pacientes';
            
            // Si formData.id existe, significa que el usuario le dio a "Editar Perfil"
            // (Asumiendo que hiciste un endpoint PUT /pacientes/{id} en tu backend)
            const metodoHTTP = formData.id ? 'PUT' : 'POST';
            const urlFinal = formData.id ? `${url}/${formData.id}` : url;

            const respuesta = await fetch(urlFinal, {
            method: metodoHTTP,
            headers: {
            'Content-Type': 'application/json',
            // Nos aseguramos de que busque 'token', que es el nombre que le pusimos en el paso 1
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(datosParaBackend)
        });

            if (respuesta.ok) {
                const pacienteGuardado = await respuesta.json();
                console.log("¡Éxito desde FastAPI!", pacienteGuardado);
                
                // --- 4. ACTUALIZAMOS LA PANTALLA DE REACT ---
                // En vez de usar datos falsos, usamos el paciente real que devolvió la base de datos
                if (formData.id) {
                    // Lógica para actualizar (Dervin lo arreglará luego)
                    alert("¡Expediente actualizado exitosamente en la base de datos!");
                } else {
                    // Transformamos el formato de tu base de datos al formato visual de Dervin
                    const pacienteParaReact = {
                        id: pacienteGuardado.id, 
                        name: pacienteGuardado.nombre,
                        phone: pacienteGuardado.telefono,
                        email: pacienteGuardado.email,
                        age: pacienteGuardado.edad,
                        condition: pacienteGuardado.diagnostico_principal,
                        status: pacienteGuardado.estado,
                        timeline: [], 
                        reports: []
                    };
                    setPatients([pacienteParaReact, ...patients]);
                    alert("¡Expediente creado exitosamente en la base de datos!");
                }
                
                setView('list'); // Volvemos al directorio
            } else {
                // Si FastAPI devuelve un error 422 o 500
                const errorData = await respuesta.json();
                console.error("El backend rechazó los datos:", errorData);
                alert("Hubo un error al guardar. Revisa la consola.");
            }
        } catch (error) {
            console.error("Error de conexión (CORS o Servidor apagado):", error);
            alert("No se pudo conectar con el servidor. ¿Está encendido FastAPI?");
        }
    };

    const handleDeletePatient = (id) => { setPatientToDelete(id); };

    const confirmDeletePatient = () => {
        setPatients(patients.filter(p => p.id !== patientToDelete));
        setPatientToDelete(null);
        setView('list'); 
    };

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
        setView('details');
    };

    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.condition.toLowerCase().includes(searchQuery.toLowerCase()));

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
                        <p className="text-slate-500 text-sm font-medium mt-1">Gestiona expedientes y consultas ({patients.length} total)</p>
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
                        <p className="text-sm text-slate-500 mt-2 font-medium">Intenta con otros términos de búsqueda.</p>
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
                                    <p className="text-xs font-bold text-[#0F766E] uppercase tracking-widest mt-1.5 truncate">{patient.condition}</p>
                                    
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
        const trend = getTrendInfo(selectedPatient.status); 

        return (
            <div className="space-y-6 relative animate-fade-in pb-10">
                <style>{cssStyles}</style>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors mb-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 w-fit hover:shadow-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Directorio</button>

                {/* HEADER DEL PERFIL */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full md:w-auto">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#0F766E] to-teal-500 text-white flex items-center justify-center font-black text-4xl shadow-xl shadow-teal-900/20 shrink-0 border-4 border-white">{selectedPatient.name.charAt(0)}</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-4 flex-wrap mb-2"><h1 className="text-3xl sm:text-4xl font-black text-[#113130] tracking-tight">{selectedPatient.name}</h1><span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${selectedPatient.status === 'Activo' ? 'bg-emerald-50 text-emerald-600' : selectedPatient.status === 'Pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{selectedPatient.status}</span></div>
                            <p className="text-sm font-black text-[#0F766E] uppercase tracking-widest bg-teal-50 inline-block px-3 py-1 rounded-lg">{selectedPatient.condition}</p>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto relative z-10 shrink-0">
                        <button onClick={() => handleOpenForm(selectedPatient)} className="flex-1 md:flex-none bg-slate-50 hover:bg-slate-100 text-[#113130] px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Editar Perfil</button>
                        <button onClick={() => handleDeletePatient(selectedPatient.id)} className="flex-1 md:flex-none bg-white border-2 border-rose-100 hover:bg-rose-50 text-rose-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Eliminar</button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    
                    {/* FILA SUPERIOR: CONTACTO Y REPORTES (APILADOS EN MÓVIL, LADO A LADO EN PC) */}
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
                                <button className="text-[#0F766E] hover:bg-teal-50 p-1.5 rounded-lg transition-colors bg-slate-50" title="Generar Nuevo"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></button>
                            </div>
                            {selectedPatient.reports && selectedPatient.reports.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedPatient.reports.map(report => (
                                        <div key={report.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors cursor-pointer group">
                                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                                            <div className="flex-1 overflow-hidden"><h4 className="text-sm font-bold text-[#113130] truncate">{report.title}</h4><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{report.date} • {report.size}</p></div>
                                            <svg className="w-4 h-4 text-slate-300 group-hover:text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-xs text-slate-500 font-bold">Sin reportes generados.</p></div>)}
                        </div>
                    </div>

                    {/* FILA INFERIOR: LÍNEA DE TIEMPO CLÍNICA (ESTILO IMAGEN) */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100 overflow-hidden">
                        
                        {/* Cabecera del Timeline */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                            <div>
                                <h3 className="text-xl font-black text-[#113130]">Historial Evolutivo</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">Línea de tiempo de sesiones y evaluaciones</p>
                            </div>
                            <button className="bg-[#113130] hover:bg-[#0D9488] text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg> Agregar Nota
                            </button>
                        </div>

                        {selectedPatient.timeline && selectedPatient.timeline.length > 0 ? (
                            <div className="relative pt-2 pb-4">
                                
                                {/* 1. LÍNEA VERTICAL CON DEGRADADO */}
                                <div className={`absolute left-6 md:left-8 top-8 bottom-0 w-1 bg-gradient-to-b ${trend.gradient} rounded-full z-0 opacity-80`}></div>
                                
                                {/* 2. PÍLDORA DE TENDENCIA */}
                                <div className="relative z-20 flex mb-10 ml-2 md:ml-4">
                                    <div className={`inline-flex items-center gap-1.5 ${trend.bg} ${trend.border} border ${trend.text} text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm`}>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={trend.icon} /></svg>
                                        {trend.label}
                                    </div>
                                </div>

                                {/* 3. TARJETAS BLANCAS CON PUNTOS HUECOS */}
                                <div className="space-y-8">
                                    {selectedPatient.timeline.map((entry, index) => (
                                        <div key={entry.id} className="relative pl-14 md:pl-20 pr-0 sm:pr-2">
                                            
                                            {/* Punto Hueco (Alineado perfecto con la línea) */}
                                            <div className={`absolute left-[19px] md:left-[27px] top-6 w-3.5 h-3.5 rounded-full bg-white border-[3px] ${trend.ring} shadow-sm z-10`}></div>
                                            
                                            {/* Tarjeta de la Nota Clínica */}
                                            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 hover:shadow-[0_8px_30px_-4px_rgba(15,118,110,0.1)] transition-all relative overflow-hidden group cursor-pointer">
                                                
                                                {/* Borde Lateral de Color */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                                    entry.type === 'Sesión' ? 'bg-blue-500' :
                                                    entry.type === 'Evaluación' ? 'bg-amber-500' :
                                                    entry.type === 'Alta' ? 'bg-emerald-500' : 'bg-teal-500'
                                                }`}></div>

                                                {/* Header de la Tarjeta */}
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap w-fit ${
                                                            entry.type === 'Sesión' ? 'bg-blue-50 text-blue-600' : 
                                                            entry.type === 'Evaluación' ? 'bg-amber-50 text-amber-600' : 
                                                            entry.type === 'Alta' ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-50 text-teal-600'
                                                        }`}>
                                                            {entry.type}
                                                        </span>
                                                        <h4 className="text-lg font-black text-[#113130] leading-tight">{entry.title}</h4>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider shrink-0 mt-1 md:mt-0">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        {entry.date}
                                                    </span>
                                                </div>
                                                
                                                {/* Descripción */}
                                                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                                                    {entry.note}
                                                </p>
                                                
                                                {/* Etiquetas Grises Abajo */}
                                                {entry.tags && entry.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-100">
                                                        {entry.tags.map((tag, idx) => (
                                                            <span key={idx} className="bg-slate-50 text-slate-500 text-[10px] font-bold px-4 py-2 rounded-full border border-slate-200/60 uppercase tracking-widest flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100"><svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                                <h4 className="text-base font-bold text-[#113130] mb-1">Sin historial evolutivo</h4><p className="text-sm font-medium text-slate-500">Comienza agregando la primera nota clínica.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL DE ELIMINACIÓN GLOBAL */}
                {patientToDelete && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                        <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setPatientToDelete(null)} />
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 shadow-2xl animate-fade-in border border-rose-100/50 text-center m-4">
                            <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
                            <h3 className="text-2xl font-black text-[#113130] mb-3">¿Eliminar Expediente?</h3><p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">Esta acción es <span className="font-bold text-rose-500">permanente</span>. Se borrarán todas las notas de sesión, historial evolutivo y reportes asociados.</p>
                            <div className="flex flex-col sm:flex-row gap-3"><button onClick={() => setPatientToDelete(null)} className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">Cancelar</button><button onClick={confirmDeletePatient} className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 transition-colors">Sí, Eliminar</button></div>
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
                            {formErrors.name && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Este campo es obligatorio</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teléfono <span className="text-rose-500">*</span></label>
                                <input 
                                    type="tel" 
                                    required
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                    placeholder="+505 8888 8888" 
                                    className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                                />
                                {formErrors.phone && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Este campo es obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    placeholder="correo@ejemplo.com" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edad <span className="text-rose-500">*</span></label>
                                <input 
                                    type="number" 
                                    required
                                    value={formData.age} 
                                    onChange={(e) => setFormData({...formData, age: e.target.value})} 
                                    placeholder="Ej. 30" 
                                    className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.age ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                                />
                                {formErrors.age && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Este campo es obligatorio</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                                <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all"
                                >
                                    <option value="Activo">Activo (En tratamiento)</option>
                                    <option value="Pendiente">Pendiente (Por evaluar)</option>
                                    <option value="Alta">Alta (Tratamiento terminado)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnóstico / Motivo de Consulta <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" 
                                required
                                value={formData.condition} 
                                onChange={(e) => setFormData({...formData, condition: e.target.value})} 
                                placeholder="Ej. Trastorno de Ansiedad..." 
                                className={`w-full rounded-2xl px-4 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.condition ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} 
                            />
                            {formErrors.condition && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Este campo es obligatorio</p>}
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

    return null;
};

export default Pacientes;