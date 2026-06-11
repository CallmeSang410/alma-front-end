import React, { useState, useEffect } from 'react';
import './Reportes.css';

// --- COMPONENTE TRADUCTOR DE MARKDOWN ---
const TextoFormateadoIA = ({ texto }) => {
    if (!texto) return null;

    const lineas = texto.split('\n');

    return (
        <div className="space-y-4 animate-fade-in">
            {lineas.map((linea, index) => {
                const textoLimpio = linea.trim();
                if (!textoLimpio) return null;

                // Títulos
                if (textoLimpio.startsWith('##')) {
                    // Limpiamos los "##"
                    const titulo = textoLimpio.replace('##', '').trim();
                    return (
                        <h4 key={index} className="text-sm font-black text-[#113130] uppercase tracking-widest mt-6 mb-2 border-b border-slate-200 pb-2">
                            {titulo}
                        </h4>
                    );
                }

                // Párrafos con negritas
                const partes = textoLimpio.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={index} className="text-[14px] text-slate-700 leading-relaxed text-justify">
                        {partes.map((parte, i) => {
                            if (parte.startsWith('**') && parte.endsWith('**')) {
                                return (
                                    <strong key={i} className="font-bold text-[#0F766E] bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100/50">
                                        {parte.slice(2, -2)}
                                    </strong>
                                );
                            }
                            return parte;
                        })}
                    </p>
                );
            })}
        </div>
    );
};
const Reportes = () => {
    // ================= ESTADOS GENERALES =================
    const [view, setView] = useState('list'); // 'list' | 'wizard' | 'reportDetail'
    const [searchQuery, setSearchQuery] = useState('');
    const [activeReport, setActiveReport] = useState(null);

    // ================= ESTADOS DE BASE DE DATOS =================
    const [pastReports, setPastReports] = useState([]);
    const [availableAppointments, setAvailableAppointments] = useState([]); 
    const [patientsData, setPatientsData] = useState([]); 

    // ================= ESTADOS DEL WIZARD =================
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [formErrors, setFormErrors] = useState({});
// ================= ESTADOS PARA EL BUSCADOR DE CITAS EN REPORTES =================
    const [busquedaCita, setBusquedaCita] = useState('');
    const [mostrarListaCitas, setMostrarListaCitas] = useState(false);

    // Filtramos las citas en tiempo real según lo que escriba el psicólogo
    const citasFiltradas = availableAppointments.filter(cita => 
        cita.labelVisual.toLowerCase().includes(busquedaCita.toLowerCase())
    );
const initialFormState = {
        cita_id: '', 
        reason: '', 
        interviewNotes: '', 
        testsUsed: [], 
        otherTestDescription: '', 
        testResults: '', // 🌟 NUEVO: El espacio para los puntajes
        analisis_ia: '', 
        finalDiagnosis: '', 
        recommendations: '', 
        nextStep: 'Tratamiento Terapéutico',
        otherNextStepDescription: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const availableTests = ["BDI-II (Depresión)", "GAD-7 (Ansiedad)", "MMPI-2", "Test de Rorschach", "Test de Bender", "Test de la Figura Humana", "Escala de Estrés Percibido", "Otros"];

    // ================= CARGA DE DATOS (FASTAPI) =================
    const cargarDatos = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // 1. Definimos los nombres de las respuestas
            const [resPacientes, resCitas, resReportes] = await Promise.all([
                fetch('http://127.0.0.1:8000/pacientes', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:8000/citas', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:8000/reportes', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            // 2. Verificamos que todos respondan OK
            if (resPacientes.ok && resCitas.ok && resReportes.ok) {
                const pacientesDB = await resPacientes.json();
                const citasDB = await resCitas.json();
                const reportesDB = await resReportes.json();

                setPatientsData(pacientesDB);

                // 3. Procesamos los reportes
                const reportesFormateados = reportesDB.map(rep => {
                    const citaAsociada = citasDB.find(c => c.id === rep.cita_id);
                    const pacienteAsociado = citaAsociada ? pacientesDB.find(p => p.id === citaAsociada.paciente_id) : null;
                    
                    return {
                        id: rep.id,
                        serialNumber: `CD-${String(rep.id).padStart(4, '0')}`,
                        patientName: pacienteAsociado ? pacienteAsociado.nombre : "Paciente Desconocido",
                        date: new Date(rep.fecha_generacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                        diagnosis: rep.diagnostico_final || 'Sin diagnóstico registrado',
                        nextStep: rep.plan_accion || 'No especificado',
                        status: "Cerrado",
                        fullData: rep 
                    };
                });

                // 4. Procesamos las citas que NO tienen reporte
                const citasSinReporte = citasDB.filter(c => !reportesDB.some(r => r.cita_id === c.id));
                const citasConNombre = citasSinReporte.map(c => {
                    const paciente = pacientesDB.find(p => p.id === c.paciente_id);
                    return {
                        ...c,
                        labelVisual: `${paciente ? paciente.nombre : 'Desconocido'} - Cita: ${new Date(c.fecha_cita).toLocaleDateString()}`
                    };
                });

                setPastReports(reportesFormateados.reverse());
                setAvailableAppointments(citasConNombre);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);





    const toggleTest = (test) => {
        setFormErrors({...formErrors, testsUsed: false}); 
        if (formData.testsUsed.includes(test)) {
            setFormData({ 
                ...formData, 
                testsUsed: formData.testsUsed.filter(t => t !== test),
                otherTestDescription: test === "Otros" ? '' : formData.otherTestDescription 
            });
        } else {
            setFormData({ ...formData, testsUsed: [...formData.testsUsed, test] });
        }
    };

    // ================= FUNCIONES DEL WIZARD =================
    
    // 🌟 NUEVA FUNCIÓN: Llama a la IA en el Paso 3
   const generarAnalisisIA = async () => {
        setIsAnalyzing(true);
        setStep(3); 
        
        try {
            const token = localStorage.getItem('token');
            
            // 🔍 1. Buscamos la cita seleccionada en tu lista de citas disponibles
            const citaSeleccionada = availableAppointments.find(
                cita => String(cita.id) === String(formData.cita_id)
            );

            // 🔍 2. Usamos el paciente_id de esa cita para buscar al paciente en tu directorio
            const pacienteSeleccionado = patientsData.find(
                paciente => paciente.id === citaSeleccionada?.paciente_id
            );

            // 🔍 3. Extraemos la edad y el sexo (si no existen, ponemos un respaldo por si acaso)
            const edadPaciente = pacienteSeleccionado?.edad ? `${pacienteSeleccionado.edad} años` : "Edad no especificada";
            const sexoPaciente = pacienteSeleccionado?.sexo || pacienteSeleccionado?.genero || "No especificado";

            // Armamos el string de pruebas igual que antes...
            let testsString = formData.testsUsed.filter(t => t !== 'Otros').join(', ');
            if (formData.testsUsed.includes('Otros') && formData.otherTestDescription) testsString += `, ${formData.otherTestDescription}`;

            // 🌟 AHORA SÍ, EL PAYLOAD TIENE DATA 100% REAL Y DINÁMICA
            const payload = {
                motivo_consulta: formData.reason,
                notas_psicologo: formData.interviewNotes,
                pruebas_aplicadas: testsString || "Ninguna",
                resultados_pruebas: formData.testResults || "No se registraron resultados cuantitativos.",
                edad_paciente: edadPaciente, // 👈 Data real del estado de React
                sexo_paciente: sexoPaciente  // 👈 Data real del estado de React
            };

            // Llamamos al endpoint de FastAPI...
            const respuesta = await fetch(`http://127.0.0.1:8000/reportes/analizar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (respuesta.ok) {
                const data = await respuesta.json();
                setFormData(prev => ({ ...prev, analisis_ia: data.analisis }));
            } else {
                setFormData(prev => ({ ...prev, analisis_ia: "⚠️ No se pudo generar el análisis. Procedé con tu evaluación manual." }));
            }
        } catch (error) {
            setFormData(prev => ({ ...prev, analisis_ia: "⚠️ Error de conexión con la IA." }));
        } finally {
            setIsAnalyzing(false);
        }
    };
    // ================= MEMORIA LOCALSTORAGE (Para Autocompletado) =================
    const [memoriaInstrumentos, setMemoriaInstrumentos] = useState([]);
    const [memoriaAcciones, setMemoriaAcciones] = useState([]);

    useEffect(() => {
        const instGuardados = JSON.parse(localStorage.getItem('hf_instrumentos')) || [];
        const accGuardadas = JSON.parse(localStorage.getItem('hf_acciones')) || [];
        setMemoriaInstrumentos(instGuardados);
        setMemoriaAcciones(accGuardadas);
    }, []);

    const guardarEnMemoria = (tipo, valor) => {
        if (!valor.trim()) return;
        
        if (tipo === 'instrumento') {
            const nuevos = [...new Set([...memoriaInstrumentos, valor])];
            setMemoriaInstrumentos(nuevos);
            localStorage.setItem('hf_instrumentos', JSON.stringify(nuevos));
        } else {
            const nuevos = [...new Set([...memoriaAcciones, valor])];
            setMemoriaAcciones(nuevos);
            localStorage.setItem('hf_acciones', JSON.stringify(nuevos));
        }
    };
    const eliminarDeMemoria = (tipo, valorAEliminar) => {
        if (tipo === 'instrumento') {
            const nuevos = memoriaInstrumentos.filter(item => item !== valorAEliminar);
            setMemoriaInstrumentos(nuevos);
            localStorage.setItem('hf_instrumentos', JSON.stringify(nuevos));
        } else {
            const nuevos = memoriaAcciones.filter(item => item !== valorAEliminar);
            setMemoriaAcciones(nuevos);
            localStorage.setItem('hf_acciones', JSON.stringify(nuevos));
        }
    };
    const handleNextStep = () => {
        const errors = {};
        
        if (step === 1) {
            if (!formData.cita_id) errors.cita_id = true;
            if (!formData.reason.trim()) errors.reason = true;
        } else if (step === 2) {
            if (!formData.interviewNotes.trim()) errors.interviewNotes = true;
            if (formData.testsUsed.length === 0) errors.testsUsed = true;
            if (formData.testsUsed.includes("Otros") && !formData.otherTestDescription.trim()) errors.otherTestDescription = true;
        } else if (step === 4) { // Ahora el final es el 4
            if (!formData.finalDiagnosis.trim()) errors.finalDiagnosis = true;
            if (!formData.recommendations.trim()) errors.recommendations = true;
            if (formData.nextStep === 'Otros' && !formData.otherNextStepDescription.trim()) errors.otherNextStepDescription = true;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        
        if (step === 1) setStep(2);
        else if (step === 2) generarAnalisisIA(); // 🌟 Del paso 2, pasamos a la IA
        else if (step === 3) setStep(4); // 🌟 De la IA, pasamos al Veredicto
        else if (step === 4) submitReportToAI(); // 🌟 Guardado final
    };

    const handlePrevStep = () => {
        setFormErrors({});
        if (step > 1) setStep(step - 1);
    };

    // ... (Tu toggleTest queda igualito, no lo toques) ...

    // 🌟 ACTUALIZAMOS EL GUARDADO FINAL PARA INCLUIR LA IA
    const submitReportToAI = async () => {
        setIsAnalyzing(true);
        
        let testsString = formData.testsUsed.filter(t => t !== 'Otros').join(', ');
        if (formData.testsUsed.includes('Otros') && formData.otherTestDescription) {
            testsString += (testsString ? ', ' : '') + `${formData.otherTestDescription}`;
        }

        const planFinal = formData.nextStep === 'Otros' ? formData.otherNextStepDescription : formData.nextStep;

        const payload = {
            motivo_consulta: formData.reason,
            notas_psicologo: formData.interviewNotes,
            pruebas_aplicadas: testsString || "Ninguna registrada",
            analisis_ia: formData.analisis_ia, // 🌟 AHORA MANDAMOS EL TEXTO DE LA IA AL BACKEND
            diagnostico_final: formData.finalDiagnosis,
            recomendaciones: formData.recommendations,
            plan_accion: planFinal
        };

        try {
            const token = localStorage.getItem('token');
            const url = `http://127.0.0.1:8000/citas/${formData.cita_id}/reporte`;
            
            const respuesta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (respuesta.ok) {
                await cargarDatos();
                setIsAnalyzing(false);
                setView('list');
                setStep(1);
                setFormData(initialFormState);
                alert("¡Informe guardado con éxito en el expediente!");
            } else {
                const errorData = await respuesta.json();
                alert(`Error al guardar: ${errorData.detail}`);
                setIsAnalyzing(false);
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor.");
            setIsAnalyzing(false);
        }
    };

    // ================= HELPERS VISUALES =================
    const ErrorIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    );

 const getStepTitle = (s) => {
        switch(s) {
            case 1: return "Datos Iniciales";
            case 2: return "Evaluación Clínica";
            case 3: return "Análisis de HorizonFlow"; // 🌟 Nuevo paso
            case 4: return "Veredicto y Cierre"; // 🌟 Ahora es el 4
            default: return "";
        }
    };

    const getBadgeStyle = (stepName) => {
        if (!stepName) return 'bg-slate-100 text-slate-600';
        if (stepName.includes('Alta')) return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        if (stepName.includes('Derivación')) return 'bg-purple-100 text-purple-800 border border-purple-200';
        if (stepName.includes('Interconsulta')) return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
        if (stepName.includes('Seguimiento')) return 'bg-amber-100 text-amber-800 border border-amber-200';
        if (stepName === 'Otros') return 'bg-slate-100 text-slate-700 border border-slate-300';
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    };

    // Buscador auxiliar para extraer info en la vista de detalle
    const getPatientInfo = (reporteFullData) => {
        const cita = availableAppointments.find(c => c.id === reporteFullData.cita_id) || { paciente_id: null };
        const paciente = patientsData.find(p => p.id === cita.paciente_id) || {};
        return paciente;
    };


    // ================= VISTA 1: LISTADO DE REPORTES =================
    if (view === 'list') {
        const filteredReports = pastReports.filter(r => 
            r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return (
            <div className="space-y-6 relative animate-fade-in pb-10">
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-5%] w-64 h-64 bg-teal-50 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-[#113130] tracking-tight">Evaluaciones y Reportes</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Sistematiza tus diagnósticos con el procesamiento de HorizonFlow.</p>
                    </div>
                    <button onClick={() => { setView('wizard'); setStep(1); setFormData(initialFormState); }} className="relative z-10 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:to-teal-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-teal-900/20 w-full md:w-auto">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg> 
                        Iniciar Evaluación
                    </button>
                </div>

                <div className="relative w-full">
                    <input type="text" placeholder="Buscar por paciente, diagnóstico o Folio (Ej. CD-0001)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all font-medium shadow-sm" />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                {filteredReports.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-[#113130]">No hay reportes generados</h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Inicia una nueva evaluación para verla aquí.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredReports.map(report => (
                            <div key={report.id} onClick={() => { setActiveReport(report); setView('reportDetail'); }} className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-sm shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-[11px] font-black text-[#113130] bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                                                Folio: {report.serialNumber}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mt-2">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {report.date}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-[#113130] leading-tight truncate">{report.patientName}</h3>
                                    <p className="text-xs font-bold text-[#0F766E] mt-2 line-clamp-2 leading-relaxed">{report.diagnosis}</p>
                                </div>
                                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-md truncate max-w-[150px] ${getBadgeStyle(report.nextStep)}`}>
                                        {report.nextStep}
                                    </span>
                                    <span className="text-[#0F766E] font-bold text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                        Ver Informe <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ================= VISTA 2: WIZARD DE EVALUACIÓN =================
    if (view === 'wizard') {
        return (
            <div className="max-w-4xl mx-auto space-y-6 relative animate-fade-in pb-10">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setView('list')} disabled={isAnalyzing} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Cancelar
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paso {step > 3 ? 3 : step} de 3</span>
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    <div className="flex gap-2 mb-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#0F766E]' : 'bg-slate-100'}`}></div>
                        ))}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-[#113130] tracking-tight">{getStepTitle(step)}</h2>
                        <p className="text-sm text-slate-500 font-medium mt-2">
                            {step === 1 && "Selecciona la cita pendiente y el motivo por el cual el paciente asiste a consulta."}
                            {step === 2 && "Documenta la entrevista, observaciones y las herramientas psicométricas aplicadas."}
                            {step === 3 && "Confirma tu diagnóstico final clínico y define el plan de acción terapéutico."}
                        </p>
                    </div>

                 {/* PASO 1: DATOS INICIALES */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            {/* ================= BUSCADOR PREMIUM DE CITAS ================= */}
                            <div className="relative animate-fade-in z-50">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Cita Pendiente <span className="text-rose-500">*</span>
                                </label>
                                
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <input 
                                        type="text"
                                        value={busquedaCita}
                                        onChange={(e) => {
                                            setBusquedaCita(e.target.value);
                                            setMostrarListaCitas(true);
                                            if (e.target.value === '') {
                                                setFormData({...formData, cita_id: ''});
                                            }
                                        }}
                                        onClick={() => setMostrarListaCitas(true)}
                                        placeholder="Buscar paciente o fecha..."
                                        className={`w-full rounded-2xl pl-11 pr-10 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.cita_id ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-white border-slate-200 focus:ring-[#0F766E] border'}`}
                                    />
                                    
                                    {busquedaCita && (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setBusquedaCita('');
                                                setFormData({...formData, cita_id: ''}); 
                                                setMostrarListaCitas(true);
                                            }}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>

                                {mostrarListaCitas && (
                                    <div className="absolute w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 animate-fade-in">
                                        {citasFiltradas.length > 0 ? (
                                            <ul className="py-2">
                                                {citasFiltradas.map((cita) => (
                                                    <li 
                                                        key={cita.id}
                                                        onClick={() => {
                                                            setFormData({...formData, cita_id: cita.id});
                                                            setBusquedaCita(cita.labelVisual);
                                                            setMostrarListaCitas(false);
                                                        }}
                                                        className="px-5 py-3 hover:bg-teal-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex flex-col"
                                                    >
                                                        {/* Separamos el label para que se vea más pro: "Nombre" arriba, "Fecha" abajo */}
                                                        <span className="text-sm font-bold text-[#113130]">
                                                            {cita.labelVisual.split(' - ')[0]}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <svg className="w-3 h-3 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            {cita.labelVisual.split(' - ')[1]}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-5 text-center text-sm text-slate-400 font-medium">
                                                No hay citas pendientes que coincidan 🗓️
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {mostrarListaCitas && (
                                    <div className="fixed inset-0 z-40" onClick={() => setMostrarListaCitas(false)}></div>
                                )}

                                {formErrors.cita_id && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Selecciona una cita del calendario</p>}
                                {availableAppointments.length === 0 && <p className="text-[11px] text-amber-600 font-bold mt-2">No hay citas pendientes sin evaluar. Crea una cita primero.</p>}
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Motivo de Consulta (Textual del paciente)</label>
                                <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Ej. 'Siento mucha presión en el pecho y no puedo dormir...'" rows="3" className={`w-full rounded-2xl px-5 py-4 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 transition-all resize-none ${formErrors.reason ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`}></textarea>
                                {formErrors.reason && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Especifica el motivo de consulta</p>}
                            </div>
                        </div>
                    )}

                    {/* PASO 2: NOTAS Y PRUEBAS */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notas de Entrevista Psicológica</label>
                                <textarea value={formData.interviewNotes} onChange={(e) => setFormData({...formData, interviewNotes: e.target.value})} placeholder="Registra las observaciones clínicas, afecto, lenguaje, pensamiento..." rows="5" className={`w-full rounded-2xl px-5 py-4 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 transition-all resize-none ${formErrors.interviewNotes ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`}></textarea>
                                {formErrors.interviewNotes && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa las notas clínicas de la evaluación</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Técnicas / Pruebas Psicométricas Aplicadas</label>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1 ${formErrors.testsUsed ? 'p-4 border border-rose-400 bg-rose-50 rounded-2xl' : ''}`}>
                                    {availableTests.map((test, idx) => (
                                        <label key={idx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.testsUsed.includes(test) ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                            <input type="checkbox" className="hidden" checked={formData.testsUsed.includes(test)} onChange={() => toggleTest(test)} />
                                            <div className={`w-4 h-4 rounded shadow-inner flex items-center justify-center shrink-0 ${formData.testsUsed.includes(test) ? 'bg-white' : 'bg-slate-100 border border-slate-300'}`}>
                                                {formData.testsUsed.includes(test) && <svg className="w-3 h-3 text-[#0F766E]" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                                            </div>
                                            <span className="text-xs font-bold leading-tight">{test}</span>
                                        </label>
                                    ))}
                                </div>
                                {formErrors.testsUsed && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Selecciona al menos un instrumento o técnica</p>}
                            </div>

                         {formData.testsUsed.includes("Otros") && (
                                <div className="animate-fade-in bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Especificar Otro Instrumento
                                    </label>
                                    
                                    {/* 1. INPUT COMPLETAMENTE LIMPIO: Le quité el list="lista-instrumentos" */}
                                    <input 
                                        type="text" 
                                        value={formData.otherTestDescription} 
                                        onChange={(e) => setFormData({...formData, otherTestDescription: e.target.value})} 
                                        onBlur={(e) => guardarEnMemoria('instrumento', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); 
                                                guardarEnMemoria('instrumento', e.target.value);
                                            }
                                        }}
                                        placeholder="Ej. Inventario de Ansiedad de Beck (BAI)..." 
                                        className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.otherTestDescription ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-white border-slate-200 focus:ring-[#0F766E] border'}`}
                                    />
                                    
                                    {/* 2. EL DATALIST YA NO EXISTE. EN SU LUGAR, DIBUJAMOS LOS CHIPS DE RECIENTES */}
                                    {/* 🌟 LA NUEVA MEMORIA CON BOTÓN DE BORRAR */}
                                    {memoriaInstrumentos.length > 0 && (
                                        <div className="mt-3 flex flex-wrap items-center gap-2 animate-fade-in">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">
                                                Recientes:
                                            </span>
                                            {memoriaInstrumentos.map((inst, idx) => (
                                                <div key={idx} className="flex items-center bg-white border border-slate-200 hover:border-[#0F766E] rounded-lg shadow-sm transition-all overflow-hidden group">
                                                    <button
                                                        type="button" 
                                                        onClick={() => setFormData({...formData, otherTestDescription: inst})}
                                                        className="px-3 py-1.5 text-slate-500 hover:bg-teal-50 hover:text-[#0F766E] text-xs font-bold transition-colors"
                                                    >
                                                        {inst}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarDeMemoria('instrumento', inst)}
                                                        className="px-2 py-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors border-l border-slate-100"
                                                        title="Eliminar de recientes"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {formErrors.otherTestDescription && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Debes describir el instrumento utilizado</p>}
                                </div>
                            )}
                            {/* 🌟 NUEVO CAMPO: RESULTADOS DE LAS PRUEBAS (Aparece si hay tests seleccionados) */}
                            {formData.testsUsed.length > 0 && (
                                <div className="animate-fade-in pt-6 border-t border-slate-100">
                                    <label className="block text-[10px] font-black text-[#0F766E] uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        Resultados de las Pruebas (Data para la IA)
                                    </label>
                                    <textarea 
                                        value={formData.testResults} 
                                        onChange={(e) => setFormData({...formData, testResults: e.target.value})} 
                                        placeholder="Ej. BDI-II: 28 puntos (Depresión Severa). GAD-7: 12 puntos..." 
                                        rows="3" 
                                        className="w-full rounded-xl px-5 py-4 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] border border-slate-200 bg-white transition-all resize-none shadow-sm"
                                    ></textarea>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                                        <svg className="w-3 h-3 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        La Inteligencia Artificial cruzará estos puntajes con las notas de la entrevista.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                   {/* 🌟 PASO 3: EL CEREBRO DE LA IA 🌟 */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            {isAnalyzing ? (
                                <div className="py-20 text-center flex flex-col items-center justify-center space-y-6">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-[#0F766E] rounded-full border-t-transparent animate-spin"></div>
                                        <svg className="w-10 h-10 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#113130] animate-pulse">HorizonFlow está analizando...</h3>
                                        <p className="text-sm text-slate-500 mt-2">Buscando patrones y generando sugerencias clínicas.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4 border-b border-teal-100 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0F766E] flex items-center justify-center">✨</div>
                                        <h3 className="text-lg font-black text-[#113130]">Análisis Generado por IA</h3>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        <TextoFormateadoIA texto={formData.analisis_ia} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 🌟 PASO 4: VEREDICTO FINAL Y CIERRE 🌟 */}
                    {step === 4 && !isAnalyzing && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnóstico Final (Profesional)</label>
                                <input type="text" value={formData.finalDiagnosis} onChange={(e) => setFormData({...formData, finalDiagnosis: e.target.value})} placeholder="Ej. Trastorno Depresivo Mayor, leve..." className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.finalDiagnosis ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} />
                                {formErrors.finalDiagnosis && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Establece un diagnóstico clínico final</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recomendaciones Terapéuticas</label>
                                <textarea value={formData.recommendations} onChange={(e) => setFormData({...formData, recommendations: e.target.value})} placeholder="Pautas a seguir, tareas o sugerencias clínicas..." rows="4" className={`w-full rounded-2xl px-5 py-4 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 transition-all resize-none ${formErrors.recommendations ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`}></textarea>
                                {formErrors.recommendations && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa las recomendaciones</p>}
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Plan de Acción Directo</label>
                                    {/* 🌟 Ajusté a grid-cols-2 en sm para que quepan bien las 5 opciones sin amontonarse */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {/* 🌟 OPCIONES EXPANDIDAS */}
                                        {['Tratamiento Terapéutico', 'Seguimiento Semanal', 'Seguimiento Quincenal', 'Seguimiento Mensual', 'Alta Médica'].map((option) => (
                                            <label key={option} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.nextStep === option ? 'bg-white border-[#0F766E] text-[#0F766E] shadow-sm' : 'bg-white border-transparent text-slate-500 hover:border-slate-300'}`}>
                                                <input type="radio" name="nextStep" className="hidden" checked={formData.nextStep === option} onChange={() => setFormData({...formData, nextStep: option, otherNextStepDescription: option !== 'Otros' ? '' : formData.otherNextStepDescription})} />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${formData.nextStep === option ? 'border-[#0F766E]' : 'border-slate-300'}`}>
                                                    {formData.nextStep === option && <div className="w-2 h-2 rounded-full bg-[#0F766E]"></div>}
                                                </div>
                                                <span className="text-xs font-bold leading-tight">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200/60">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Derivaciones y Otras Acciones</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {['Derivación', 'Interconsulta', 'Otros'].map((option) => (
                                            <label key={option} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.nextStep === option ? 'bg-white border-[#0F766E] text-[#0F766E] shadow-sm' : 'bg-white border-transparent text-slate-500 hover:border-slate-300'}`}>
                                                <input type="radio" name="nextStep" className="hidden" checked={formData.nextStep === option} onChange={() => setFormData({...formData, nextStep: option, otherNextStepDescription: option !== 'Otros' ? '' : formData.otherNextStepDescription})} />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${formData.nextStep === option ? 'border-[#0F766E]' : 'border-slate-300'}`}>
                                                    {formData.nextStep === option && <div className="w-2 h-2 rounded-full bg-[#0F766E]"></div>}
                                                </div>
                                                <span className="text-xs font-bold leading-tight">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {formData.nextStep === 'Otros' && (
                                    <div className="animate-fade-in bg-white p-5 rounded-xl border border-slate-200 mt-2 shadow-sm">
                                        
                                        {/* 🌟 INPUT LIMPIO */}
                                        <input 
                                            type="text" 
                                            value={formData.otherNextStepDescription} 
                                            onChange={(e) => setFormData({...formData, otherNextStepDescription: e.target.value})} 
                                            onBlur={(e) => guardarEnMemoria('accion', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault(); 
                                                    guardarEnMemoria('accion', e.target.value);
                                                }
                                            }}
                                            placeholder="Ej. Ingreso a programa de rehabilitación..." 
                                            className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.otherNextStepDescription ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`}
                                        />
                                        
                                        {/* 🌟 LA NUEVA MEMORIA VISUAL (CHIPS PREMIUM) */}
                                        {/* 🌟 LA NUEVA MEMORIA CON BOTÓN DE BORRAR */}
                                        {memoriaAcciones.length > 0 && (
                                            <div className="mt-3 flex flex-wrap items-center gap-2 animate-fade-in">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">
                                                    Recientes:
                                                </span>
                                                {memoriaAcciones.map((acc, idx) => (
                                                    <div key={idx} className="flex items-center bg-white border border-slate-200 hover:border-[#0F766E] rounded-lg shadow-sm transition-all overflow-hidden group">
                                                        <button
                                                            type="button" 
                                                            onClick={() => setFormData({...formData, otherNextStepDescription: acc})}
                                                            className="px-3 py-1.5 text-slate-500 hover:bg-teal-50 hover:text-[#0F766E] text-xs font-bold transition-colors"
                                                        >
                                                            {acc}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarDeMemoria('accion', acc)}
                                                            className="px-2 py-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors border-l border-slate-100"
                                                            title="Eliminar de recientes"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {formErrors.otherNextStepDescription && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Debes describir la acción a seguir</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botonera del Wizard */}
                    {step <= 4 && !isAnalyzing && (
                        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                            <button 
                                onClick={handlePrevStep}
                                disabled={step === 1}
                                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Atrás
                            </button>
                            <button 
                                onClick={handleNextStep}
                                disabled={availableAppointments.length === 0}
                                className="px-8 py-3.5 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {step === 1 ? 'Siguiente: Notas' : 
                                 step === 2 ? <>✨ Analizar con IA</> : 
                                 step === 3 ? 'Siguiente: Diagnóstico Final' : 
                                 'Guardar Expediente'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

// ================= VISTA 3: INFORME FINAL (DOCUMENTO) =================
if (view === 'reportDetail' && activeReport) {
    // 🌟 EL CAMBIO CLAVE: Agarramos los datos que ya vienen unidos del backend
    const repData = activeReport.fullData;
    
    // Si la ventanilla GET /reportes funcionó, paciente_data estará ahí.
    // Si acabamos de crear el reporte, paciente_data también estará ahí gracias al backend actualizado.
    const pInfo = repData.paciente_data || {}; 

   return (
       <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-0 print:max-w-full">
                                
                                {/* 🌟 ENCABEZADO MEMBRETADO (Oculto en web, aparece al imprimir) */}
                                <div className="hidden print:flex items-center justify-between border-b-2 border-[#0F766E] pb-6 mb-8 w-full">
                                    <div>
                                        <h1 className="text-2xl font-black text-[#0F766E] tracking-tight uppercase">HorizonFlow</h1>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Sistema de Gestión Clínica e Inteligencia Artificial</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-[#113130]">EXPEDIENTE CLÍNICO AUTOMATIZADO</p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Fecha de Emisión: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
            <div className="bg-white rounded-[2rem] p-10 sm:p-16 shadow-2xl border border-slate-200 font-serif text-slate-800 relative">
                {/* ... Header del documento queda igual ... */}
            {/* CONTENEDOR DE BOTONES (Se ocultará automáticamente al imprimir) */}
<div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
    <button 
        onClick={() => setView('list')} 
        className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-all bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md w-fit"
    >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg> 
        CERRAR REPORTE
    </button>

    {/* 🌟 NUEVO BOTÓN: DISPARA EL PDF NATIVO */}
    <button 
        onClick={() => window.print()} // 🚀 Dispara el diálogo de guardado en PDF del navegador
        className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-black uppercase tracking-widest transition-all px-6 py-2.5 rounded-xl shadow-md hover:shadow-xl w-fit"
    >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        EXPORTAR A PDF
    </button>
</div>
                {/* ============================================================== */}
                                {/* 🌟 AJUSTE 1: Eliminamos 'space-y-8' y usamos margen nativo      */}
                                {/*     El space-y acumula márgenes y crea los espacios 'malparidos'   */}
                                {/*     al imprimir. Dejamos que cada section maneje su margen.      */}
                                {/* ============================================================== */}
                                <div className="leading-relaxed print:w-full">
                                    
                                    {/* ========================================================== */}
                                    {/* 🌟 AJUSTE 2: print:break-inside-avoid a CADA section       */}
                                    {/*     Agregué 'mb-8' (equivalente a space-y-8) y 'pb-2'       */}
                                    {/*     para mantener el diseño web idéntico.                     */}
                                    {/* ========================================================== */}
                                    
                                    {/* I. DATOS GENERALES */}
                                    <section className="print:break-inside-avoid mb-8 pb-2">
                                        <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">I. Datos Generales</h2>
                                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-6 rounded-2xl font-sans border border-slate-100">
                                            <div><span className="font-bold text-slate-500 block mb-1">Paciente:</span> <span className="font-bold text-[#113130] text-base">{activeReport.patientName}</span></div>
                                            <div><span className="font-bold text-slate-500 block mb-1">Edad:</span> <span className="font-bold text-[#113130] text-base">{pInfo.edad || 'N/E'} años</span></div>
                                            <div><span className="font-bold text-slate-500 block mb-1">Teléfono:</span> <span className="font-bold text-[#113130] text-base">{pInfo.telefono || 'N/E'}</span></div>
                                            <div><span className="font-bold text-slate-500 block mb-1">Evaluador:</span> <span className="font-bold text-[#113130] text-base">Psicólogo Autorizado</span></div>
                                        </div>
                                    </section>

                                    {/* II. MOTIVO DE CONSULTA */}
                                    <section className="print:break-inside-avoid mb-8 pb-2">
                                        <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">II. Motivo de Consulta</h2>
                                        <p className="text-[15px] text-justify text-slate-700 mb-6 whitespace-pre-wrap">
                                            {repData.motivo_consulta || "No especificado."}
                                        </p>
                                    </section>

                                    {/* III. TÉCNICAS E INSTRUMENTOS APLICADOS */}
                                    <section className="print:break-inside-avoid mb-8 pb-2">
                                        <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">III. Técnicas e Instrumentos Aplicados</h2>
                                        <p className="text-[15px] text-justify text-slate-700 mb-6 whitespace-pre-wrap">
                                            {repData.pruebas_aplicadas || "Entrevista clínica semiestructurada."}
                                        </p>
                                    </section>

                                    {/* IV. ANÁLISIS Y OBSERVACIONES CLÍNICAS */}
                                    <section className="print:break-inside-avoid mb-8 pb-2">
                                        <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">IV. Análisis y Observaciones Clínicas</h2>
                                        <p className="text-[15px] text-justify text-slate-700 mb-6 whitespace-pre-wrap">
                                            {repData.notas_psicologo}
                                        </p>
                                    </section>

                                    {/* V. ANÁLISIS CLÍNICO (LIMPIADO) */}
                                    <section className="print:break-inside-avoid mb-8 pb-2">
                                        <div className="mt-8 bg-slate-50 p-8 rounded-3xl border border-slate-100 font-sans shadow-inner">
                                            <p className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest mb-5 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                V. Análisis Clínico y Fundamentación DSM-5 (Generado por ALMA AI)
                                            </p>
                                            <TextoFormateadoIA texto={repData.analisis_ia} />
                                        </div>
                                    </section>

                                    {/* VI. DIAGNÓSTICO CLÍNICO */}
                                    <section className="print:break-inside-avoid mb-8 pb-2">
                                        <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">VI. Diagnóstico Clínico</h2>
                                        <p className="text-xl font-bold text-[#113130] bg-slate-50 p-5 rounded-2xl text-center font-sans border border-slate-200 shadow-inner">
                                            {activeReport.diagnosis || repData.diagnostico_final}
                                        </p>
                                    </section>

                                  {/* VII. RECOMENDACIONES Y PLAN A SEGUIR */}
                                    {/* 🌟 Le regresamos el print:break-inside-avoid */}
                                    <section className="mb-8 pb-2 print:block print:break-inside-avoid">
                                        
                                        {/* 🌟 Le ponemos print:break-after-avoid al H2 para que el título JAMÁS se separe de su párrafo */}
                                        <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans print:break-after-avoid">
                                            VII. Recomendaciones y Plan a Seguir
                                        </h2>
                                        
                                        <p className="text-[15px] whitespace-pre-wrap text-slate-700 mb-6">
                                            {repData.recomendaciones}
                                        </p>
                                        
                                        {repData.plan_accion && (
                                            <p className="text-[15px] whitespace-pre-wrap text-slate-700 mb-6">
                                                <span className="font-bold text-[#113130] block mb-1">Plan de Acción:</span>
                                                {repData.plan_accion}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans w-fit mt-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Decisión Clínica:</span>
                                            <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm ${getBadgeStyle(activeReport.nextStep)}`}>
                                                {activeReport.nextStep}
                                            </span>
                                        </div>
                                    </section>

                                    {/* FIRMAS ORIGINALES (Restauradas para verse en Web y PDF) */}
                                    <div className="mt-24 pt-10 grid grid-cols-2 gap-10 font-sans print:break-inside-avoid">
                                        <div className="border-t-2 border-slate-300 pt-4 text-center">
                                            <p className="text-sm font-black text-[#113130] uppercase tracking-widest">Firma del Profesional</p>
                                            <p className="text-xs text-slate-500 font-bold mt-1">Reg. Médico: Pendiente</p>
                                        </div>
                                        <div className="border-t-2 border-slate-300 pt-4 text-center opacity-50">
                                            <p className="text-sm font-black text-[#113130] uppercase tracking-widest">Sello de la Clínica</p>
                                            <p className="text-xs text-slate-500 font-bold mt-1">HorizonFlow Systems</p>
                                        </div>
                                    </div>

                                    {/* 🌟 PIE DE PÁGINA EXCLUSIVO PARA EL PDF (Para firmas legales) */}
                                    <section className="hidden print:block mt-16 w-full print:break-inside-avoid">
                                        <div className="flex justify-between items-center">
                                            <div className="w-48 border-t border-slate-300 pt-2 text-center">
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Firma del Psicólogo</p>
                                                <p className="text-[9px] font-medium text-slate-400 mt-0.5">Código Profesional</p>
                                            </div>
                                            <div className="text-right text-[9px] font-medium text-slate-400">
                                                <p>Este documento fue validado mediante el módulo cognitivo de HorizonFlow.</p>
                                                <p>Información confidencial sujeta a secreto profesional.</p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

        );
    }
    
    return null;
};

export default Reportes;