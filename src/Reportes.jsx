import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import './Reportes.css';
import { useAlerta, AlertaProvider } from './AlertaContext.jsx'; // 🌟 Importación del sistema nativo
import api from './api'; // Importás tu instancia de axios que configuramos antes

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
    // 🛡️ ESCUDO ANTI-PANTALLA BLANCA
    const contextoAlerta = useAlerta();
    const mostrarAlerta = contextoAlerta ? contextoAlerta.mostrarAlerta : (tipo, titulo, mensaje) => {
        console.warn("⚠️ ALERTA NATIVA NO DETECTADA: Usando fallback.");
        alert(`${titulo}: ${mensaje}`);
    };

    // ================= 1. ESTADOS GENERALES =================
    const [view, setView] = useState('list'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [activeReport, setActiveReport] = useState(null);

    // ================= 2. ESTADOS DE BASE DE DATOS =================
    const [pastReports, setPastReports] = useState([]);
    const [availableAppointments, setAvailableAppointments] = useState([]); 
    const [patientsData, setPatientsData] = useState([]); 

    // ================= 3. ESTADOS DEL WIZARD =================
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [modoManual, setModoManual] = useState(false); // 🌟 Declarado UNA SOLA VEZ

    // ================= 4. ESTADOS DEL FORMULARIO =================
    const initialFormState = {
        cita_id: '', 
        reason: '', 
        interviewNotes: '', 
        testsUsed: [], 
        otherTestDescription: '', 
        testResults: '', 
        analisis_ia: '', 
        finalDiagnosis: '', 
        recommendations: '', 
        nextStep: 'Tratamiento Terapéutico',
        otherNextStepDescription: '',
        
        // 🌟 NUEVOS ESTADOS PARA EL SWITCH
        revaluacionActiva: false,
        nuevoDiagnostico: ''
    };
    const [formData, setFormData] = useState(initialFormState); // 🌟 Nace formData

    // ================= 5. ESTADOS PARA EL BUSCADOR DE CITAS =================
    const [busquedaCita, setBusquedaCita] = useState('');
    const [mostrarListaCitas, setMostrarListaCitas] = useState(false);

    const citasFiltradas = availableAppointments.filter(cita => 
        cita.labelVisual.toLowerCase().includes(busquedaCita.toLowerCase())
    );

    // ================= 6. LÓGICA DE SEGUIMIENTO E INSTRUMENTOS =================
    const availableTests = ["BDI-II (Depresión)", "GAD-7 (Ansiedad)", "MMPI-2", "Test de Rorschach", "Test de Bender", "Test de la Figura Humana", "Escala de Estrés Percibido", "Otros"];

    // 🌟 El detector lee formData solo DESPUÉS de que fue creado arriba
    const citaSeleccionada = availableAppointments.find(c => String(c.id) === String(formData.cita_id));
    const pacienteSeleccionado = patientsData.find(p => p.id === citaSeleccionada?.paciente_id);
    
    // 🌟 AHORA SÍ: Busca si este paciente_id ya tiene reportes guardados
    const esSeguimiento = pastReports.some(rep => rep.paciente_id === pacienteSeleccionado?.id);

    // ================= 7. CARGA DE DATOS (FASTAPI) =================
    const cargarDatos = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const [resPacientes, resCitas, resReportes] = await Promise.all([
                api.get('/pacientes'),
                api.get('/citas'),
                api.get('/reportes')
            ]);

            // En axios, la data ya viene parseada en 'data', no usamos .json() ni comprobamos .ok
            const pacientesDB = resPacientes.data;
            const citasDB = resCitas.data;
            const reportesDB = resReportes.data;

            setPatientsData(pacientesDB);

            const reportesFormateados = reportesDB.map(rep => {
                const citaAsociada = citasDB.find(c => c.id === rep.cita_id);
                const pacienteAsociado = citaAsociada ? pacientesDB.find(p => p.id === citaAsociada.paciente_id) : null;
                
                // 🌟 MAGIA PARA LAS TARJETAS: Embellecemos el texto principal y cuidamos la privacidad
                let textoDiagnostico = rep.diagnostico_final || "";
                
                // Verificamos si es seguimiento
                const esSeguimientoVisual = !textoDiagnostico || textoDiagnostico.toLowerCase().includes('sin diagnóstico') || textoDiagnostico.toLowerCase().includes('seguimiento');
                
                if (esSeguimientoVisual) {
                    textoDiagnostico = "🔄 Sesión de Seguimiento Terapéutico";
                } else {
                    // 🌟 NUEVO: Si es un diagnóstico real, lo ocultamos y ponemos "Informe Psicológico"
                    textoDiagnostico = "📋 Informe Psicológico";
                }
                
                return {
                    id: rep.id,
                    paciente_id: pacienteAsociado ? pacienteAsociado.id : null,
                    serialNumber: pacienteAsociado ? `CD-${String(pacienteAsociado.id).padStart(4, '0')}` : `CD-0000`,
                    patientName: pacienteAsociado ? pacienteAsociado.nombre : "Paciente Desconocido",
                    date: new Date(rep.fecha_generacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                    
                    // 🌟 APLICAMOS EL TEXTO EMBELLECIDO AQUÍ
                    diagnosis: textoDiagnostico, 
                    
                    nextStep: rep.plan_accion || 'No especificado',
                    status: "Cerrado",
                    fullData: rep 
                };
            });

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

    const generarAnalisisIA = async () => {
        setIsAnalyzing(true);
        setStep(3); 
        
        try {
            // 🌟 Con axios ya no hace falta obtener el token aquí porque `api` lo inyecta automáticamente.
            const citaSeleccionada = availableAppointments.find(
                cita => String(cita.id) === String(formData.cita_id)
            );

            const pacienteSeleccionado = patientsData.find(
                paciente => paciente.id === citaSeleccionada?.paciente_id
            );

            const edadPaciente = pacienteSeleccionado?.edad ? `${pacienteSeleccionado.edad} años` : "Edad no especificada";
            const sexoPaciente = pacienteSeleccionado?.sexo || pacienteSeleccionado?.genero || "No especificado";

            let testsString = formData.testsUsed.filter(t => t !== 'Otros').join(', ');
            if (formData.testsUsed.includes('Otros') && formData.otherTestDescription) testsString += `, ${formData.otherTestDescription}`;

            const payload = {
                motivo_consulta: formData.reason,
                notas_psicologo: formData.interviewNotes, // ✅ CORREGIDO A "notas"
                pruebas_aplicadas: testsString || "Ninguna",
                resultados_pruebas: formData.testResults || "No se registraron resultados cuantitativos.",
                edad_paciente: edadPaciente, 
                sexo_paciente: sexoPaciente  
            };

            // 🌟 AQUI ESTA LA MAGIA DE AXIOS
            const respuesta = await api.post('/reportes/analizar', payload);

            // Axios no tiene `respuesta.ok`, asume que si no hay un error, todo salió bien. 
            // Además, los datos JSON ya vienen parseados dentro de `respuesta.data`
            setFormData(prev => ({ ...prev, analisis_ia: respuesta.data.analisis }));
        
        } catch (error) {
            // Si hay un error, Axios captura la excepción aquí
            console.error("Error al generar análisis con IA:", error);
            const mensajeBackend = error.response?.data?.detail || "Error de conexión con la IA.";
            setFormData(prev => ({ ...prev, analisis_ia: `⚠️ No se pudo generar el análisis. Procedé con tu evaluación manual. Razón: ${mensajeBackend}` }));
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ================= MEMORIA LOCALSTORAGE =================
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
           // if (formData.testsUsed.length === 0) errors.testsUsed = true;
            if (formData.testsUsed.includes("Otros") && !formData.otherTestDescription.trim()) errors.otherTestDescription = true;
        } else if (step === 4) { 
            if (!formData.analisis_ia || !formData.analisis_ia.trim()) errors.analisis_ia = true;

            if (!esSeguimiento) {
                if (!formData.finalDiagnosis.trim()) errors.finalDiagnosis = true;
                if (!formData.recommendations.trim()) errors.recommendations = true;
            } else if (esSeguimiento && formData.revaluacionActiva) {
                // 🌟 NUEVO: Exigir ambas cosas si prendió el Switch
                if (!formData.nuevoDiagnostico.trim()) errors.nuevoDiagnostico = true;
                if (!formData.recommendations.trim()) errors.recommendations = true;
            }
            
            if (formData.nextStep === 'Otros' && !formData.otherNextStepDescription.trim()) errors.otherNextStepDescription = true;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        
        if (step === 1) setStep(2);
        else if (step === 2) generarAnalisisIA(); 
        else if (step === 3) setStep(4); 
        else if (step === 4) submitReportToAI(); 
    };

    const handlePrevStep = () => {
        setFormErrors({});
        // 🌟 CORRECCIÓN: Si estamos en el paso 4 y nos saltamos la IA, regresamos directo al paso 2
        if (step === 4 && (modoManual || esSeguimiento)) {
            setStep(2);
        } else if (step > 1) {
            setStep(step - 1);
        }
    };

    const submitReportToAI = async () => {
    setIsAnalyzing(true);
    
    // 1. Preparación de strings y datos (Se mantiene exactamente igual)
    let testsString = formData.testsUsed.filter(t => t !== 'Otros').join(', ');
    if (formData.testsUsed.includes('Otros') && formData.otherTestDescription) {
        testsString += (testsString ? ', ' : '') + `${formData.otherTestDescription}`;
    }

    const planFinal = formData.nextStep === 'Otros' ? formData.otherNextStepDescription : formData.nextStep;

    const payload = {
        motivo_consulta: formData.reason,
        notas_psicologo: formData.interviewNotes,
        pruebas_aplicadas: testsString || "Ninguna registrada",
        analisis_ia: formData.analisis_ia, 
        
        diagnostico_final: (esSeguimiento && formData.revaluacionActiva) 
            ? `Revaluación Diagnóstica: ${formData.nuevoDiagnostico}` 
            : (esSeguimiento ? "Sesión de Seguimiento Terapéutico" : formData.finalDiagnosis),
        
        recomendaciones: (esSeguimiento && formData.revaluacionActiva)
            ? formData.recommendations 
            : (esSeguimiento ? "Continuar con el proceso terapéutico." : formData.recommendations),
        
        actualizar_diagnostico_paciente: (esSeguimiento && formData.revaluacionActiva) 
            ? formData.nuevoDiagnostico 
            : (!esSeguimiento ? formData.finalDiagnosis : null)
    };

    try {
        // 2. Petición POST con Axios
        // api.post( url, data ) -> Envía el payload como objeto directo sin JSON.stringify
        await api.post(`/citas/${formData.cita_id}/reporte`, payload);

        // 3. Éxito (Si entra aquí es porque FastAPI respondió un estado 2xx)
        await cargarDatos();
        setIsAnalyzing(false);
        setView('list');
        setStep(1);
        setFormData(initialFormState);
        mostrarAlerta('exito', '¡Guardado!', '¡Informe guardado con éxito en el expediente!'); 

    } catch (error) {
        console.error("Error al guardar informe:", error);
        setIsAnalyzing(false);

        // 4. Captura inteligente de errores de FastAPI
        if (error.response) {
            // El backend rechazó la petición (ej: un 422 de validación de Pydantic o un 400)
            const mensajeBackend = error.response.data?.detail || 'Error desconocido al procesar el informe.';
            mostrarAlerta('error', 'Error al Guardar', `Error al guardar: ${mensajeBackend}`);
        } else {
            // Error de red (Backend apagado o problemas de conexión)
            mostrarAlerta('error', 'Error de Red', 'No se pudo conectar con el servidor.');
        }
    }
};
     // 🌟 FUNCIÓN BYPASS: Manda al psicólogo a redactar manualmente
    const handleGuardarSinIA = () => {
        const errors = {};
        if (!formData.interviewNotes.trim()) errors.interviewNotes = true;
        //if (formData.testsUsed.length === 0) errors.testsUsed = true;
        if (formData.testsUsed.includes("Otros") && !formData.otherTestDescription.trim()) errors.otherTestDescription = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            mostrarAlerta('error', 'Faltan datos', 'Completá las notas y pruebas antes de avanzar.');
            return;
        }
        
        setFormErrors({});
        
        
        // Activamos el modo manual, limpiamos cualquier rastro de IA y lo mandamos al Paso 4
        setModoManual(true);
        setFormData(prev => ({...prev, analisis_ia: ''}));
        setStep(4); 
    };
    const ErrorIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    );

    const getStepTitle = (s) => {
        // 🌟 TÍTULOS ESPECIALES PARA SEGUIMIENTO
        if (esSeguimiento) {
            switch(s) {
                case 1: return "Cita de Seguimiento";
                case 2: return "Evolución y Avances";
                case 4: return "Reporte de Sesión Terapéutica"; 
                default: return "";
            }
        }
        // Títulos normales para primera vez
        switch(s) {
            case 1: return "Datos Iniciales";
            case 2: return "Evaluación Clínica";
            case 3: return "Análisis de HorizonFlow"; 
            case 4: return "Veredicto y Cierre"; 
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
                    <button onClick={() => { setView('wizard'); setStep(1); setFormData(initialFormState); setModoManual(false); }} className="relative z-10 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:to-teal-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-teal-900/20 w-full md:w-auto">
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
                            {/* Textos si es primera vez */}
                            {!esSeguimiento && step === 1 && "Selecciona la cita pendiente y el motivo por el cual el paciente asiste a consulta."}
                            {!esSeguimiento && step === 2 && "Documenta la entrevista, observaciones y las herramientas psicométricas aplicadas."}
                            {!esSeguimiento && step === 3 && "Confirma tu diagnóstico final clínico y define el plan de acción terapéutico."}
                            {!esSeguimiento && step === 4 && "Establece el diagnóstico final y el plan de tratamiento."}
                            
                            {/* 🌟 TEXTOS NUEVOS PARA SEGUIMIENTO */}
                            {esSeguimiento && step === 1 && "Selecciona la cita para agregar un nuevo reporte al expediente de este paciente."}
                            {esSeguimiento && step === 2 && "Anota los temas tratados hoy, el estado emocional del paciente y sus avances."}
                            {esSeguimiento && step === 4 && "Guarda tus notas de evolución y define cuál será el siguiente paso en la terapia."}
                        </p>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
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

                    {step === 4 && !isAnalyzing && (
                        <div className="space-y-6 animate-fade-in">
                            
                            {/* 🌟 LA CAJA DE TEXTO AHORA SIEMPRE SALE (Para redactar o editar la IA) */}
                            <div>
                                <label className="block text-[10px] font-black text-[#0F766E] uppercase tracking-widest mb-2">
                                    {esSeguimiento 
                                        ? "Notas de Evolución Terapéutica" 
                                        : (modoManual ? "Análisis Clínico y de Evolución (Redacción Manual)" : "Análisis de IA (Puedes editar el texto antes de guardar)")} 
                                    <span className="text-rose-500">*</span>
                                </label>
                                <textarea 
                                    value={formData.analisis_ia || ''} 
                                    onChange={(e) => setFormData({...formData, analisis_ia: e.target.value})} 
                                    placeholder={esSeguimiento ? "Escribe aquí los detalles de la sesión, progreso del paciente y tareas asignadas..." : "Escribe aquí tu análisis clínico completo..."} 
                                    rows="8" 
                                    className={`w-full rounded-2xl px-5 py-4 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] border border-slate-200 bg-white shadow-inner resize-y transition-all ${formErrors.analisis_ia ? 'border-rose-400 bg-rose-50' : ''}`}
                                ></textarea>
                                {formErrors.analisis_ia && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Este campo no puede estar vacío.</p>}
                            </div>
                            
                            {/* 🌟 SWITCH DE REVALUACIÓN (Solo aparece en Seguimientos) */}
                            {esSeguimiento && (
                                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 mt-4 transition-all">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <div className="relative flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="peer sr-only"
                                                checked={formData.revaluacionActiva}
                                                onChange={(e) => setFormData({...formData, revaluacionActiva: e.target.checked})}
                                            />
                                            {/* El switch visual */}
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                        </div>
                                        <span className="text-sm font-black text-amber-900 tracking-tight">
                                            ¿Ajustar o cambiar el diagnóstico del paciente?
                                        </span>
                                    </label>
                                    
                                   {/* 🌟 LA CAJA QUE APARECE SI EL SWITCH ESTÁ ENCENDIDO */}
                                    {formData.revaluacionActiva && (
                                        <div className="mt-5 animate-fade-in border-t border-amber-200/60 pt-5 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">
                                                    Nuevo Diagnóstico Clínico <span className="text-rose-500">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={formData.nuevoDiagnostico} 
                                                    onChange={(e) => setFormData({...formData, nuevoDiagnostico: e.target.value})} 
                                                    placeholder="Ej. Trastorno de Ansiedad Generalizada (Ajuste por evolución)..." 
                                                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.nuevoDiagnostico ? 'border-rose-400 bg-rose-50 ring-rose-200' : 'bg-white border-amber-200 focus:ring-amber-500 border'}`} 
                                                />
                                                {formErrors.nuevoDiagnostico && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Debes escribir el nuevo diagnóstico</p>}
                                            </div>
                                            
                                            {/* 🌟 NUEVO: CAJA DE RECOMENDACIONES */}
                                            <div>
                                                <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">
                                                    Nuevas Recomendaciones Terapéuticas <span className="text-rose-500">*</span>
                                                </label>
                                                <textarea 
                                                    value={formData.recommendations} 
                                                    onChange={(e) => setFormData({...formData, recommendations: e.target.value})} 
                                                    placeholder="Nuevas pautas a seguir, enfoque clínico o tareas..." 
                                                    rows="3" 
                                                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 transition-all resize-none ${formErrors.recommendations ? 'border-rose-400 bg-rose-50 ring-rose-200' : 'bg-white border-amber-200 focus:ring-amber-500 border'}`} 
                                                ></textarea>
                                                {formErrors.recommendations && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa las nuevas recomendaciones</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 🌟 ESTOS CAMPOS DESAPARECEN SOLO SI ES SEGUIMIENTO (Sin importar si usaste IA o no) */}
                            {!esSeguimiento && (
                                <>
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
                                </>
                            )}
                            
                            {/* EL PLAN DE ACCIÓN SIEMPRE SE MUESTRA (Opciones de Derivación, Alta, etc.) */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Plan de Acción Directo</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

                    {step <= 4 && !isAnalyzing && (
                        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                            <button 
                                onClick={handlePrevStep}
                                disabled={step === 1}
                                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Atrás
                            </button>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                {/* 🌟 EL NUEVO BOTÓN: Solo aparece en el Paso 2 */}
                                {step === 2 && (
                                    <button 
                                        onClick={handleGuardarSinIA}
                                        className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        Guardar Solo Notas (Sin IA) / Seguimiento Terapéutico 
                                    </button>
                                )}

                                <button 
                                    onClick={handleNextStep}
                                    disabled={availableAppointments.length === 0}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {step === 1 ? 'Siguiente: Notas' : 
                                     step === 2 ? <>✨ Analizar con IA</> : 
                                     step === 3 ? 'Siguiente: Diagnóstico Final' : 
                                     'Guardar Expediente'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

   // ================= VISTA 3: INFORME FINAL (DOCUMENTO) =================
    if (view === 'reportDetail' && activeReport) {
        const repData = activeReport.fullData;
        const pInfo = repData.paciente_data || {}; 

        // 🌟 EL DETECTOR BLINDADO: Agarra el texto de la pantalla, lo pasa a minúsculas y busca la palabra clave
        const textoDiagnostico = String(activeReport.diagnosis || repData.diagnostico_final || "").toLowerCase();
        
        // Es seguimiento SOLO si dice "seguimiento" o "sin diagnóstico", pero NO si dice "revaluación"
        const esReporteSeguimiento = (textoDiagnostico.includes('seguimiento') || textoDiagnostico.includes('sin diagnóstico')) && !textoDiagnostico.includes('revaluación');

        // 🌟 Función para exportar a MS Word... (lo que ya tenés abajo)

       // 🌟 NUEVO: Función para exportar a MS Word (Versión Clínica Premium)
        const exportarAWord = () => {
            const repData = activeReport.fullData;
            const pInfo = repData.paciente_data || {};
            const fechaEmision = new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });

            // 🧹 ASPIRADORA DE MARKDOWN: Limpiamos la basura de la IA para que Word lo lea perfecto
            let analisisIA = repData.analisis_ia || "";
            
            // 1. Convierte los "## Titulo" en subtítulos reales y elegantes de Word
            analisisIA = analisisIA.replace(/##\s*(.*?)(?=\n|$)/g, '<h3 style="color: #0F766E; font-size: 12pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 18px; margin-bottom: 6px;">$1</h3>');
            
            // 2. Convierte los asteriscos **negrita** a tags <b> reales
            analisisIA = analisisIA.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            // 3. Arregla los saltos de línea y quita los asteriscos sueltos de las listas (*)
            analisisIA = analisisIA.replace(/\n\*/g, '<br>•').replace(/\n/g, '<br>');

            // 🎨 PLANTILLA HTML/CSS ADAPTADA PARA EL MOTOR DE MICROSOFT WORD
            const htmlWord = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Expediente HorizonFlow</title>
                <style>
                    /* Word prefiere fuentes estándar y medidas en puntos (pt) */
                    body { font-family: 'Calibri', 'Arial', sans-serif; color: #1e293b; font-size: 11pt; line-height: 1.5; }
                    
                    /* Cabecera del Documento */
                    .header-table { width: 100%; border-bottom: 2px solid #0F766E; margin-bottom: 20px; }
                    .header-title { color: #0F766E; font-size: 24pt; font-weight: bold; margin: 0; font-family: 'Arial Black', sans-serif; letter-spacing: -1px; }
                    .header-sub { color: #64748b; font-size: 9pt; text-transform: uppercase; margin: 0; }
                    .header-right { text-align: right; color: #475569; font-size: 9pt; }
                    
                    /* Títulos de Sección */
                    h2 { color: #0f172a; font-size: 12pt; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; }
                    
                    /* Párrafos normales */
                    p { margin-top: 0; margin-bottom: 10px; text-align: justify; }
                    
                    /* Tabla de Datos Generales (Estilo limpio) */
                    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    .data-table td { border: 1px solid #cbd5e1; padding: 10px; width: 50%; vertical-align: top; background-color: #f8fafc; }
                    .lbl { font-weight: bold; color: #64748b; font-size: 9pt; display: block; text-transform: uppercase; margin-bottom: 4px; }
                    .val { font-weight: bold; color: #0f172a; font-size: 11pt; }
                    
                    /* Caja de Diagnóstico (Estilo Receta Médica) */
                    .diag-box { border: 2px solid #0F766E; background-color: #f0fdfa; padding: 15px; text-align: center; font-weight: bold; font-size: 13pt; color: #0f172a; margin: 20px 0; }
                    
                    /* Bloque de Firmas */
                    .signatures { width: 100%; margin-top: 70px; border-collapse: collapse; }
                    .sig-td { width: 50%; text-align: center; padding: 10px; vertical-align: bottom; }
                    .sig-line { border-top: 1px solid #333; margin: 0 20px; padding-top: 8px; font-weight: bold; font-size: 10pt; text-transform: uppercase; }
                    .sig-sub { color: #64748b; font-size: 9pt; font-weight: normal; }
                </style>
            </head>
            <body>
                <table class="header-table">
                    <tr>
                        <td style="vertical-align: bottom;">
                            <p class="header-title">HorizonFlow</p>
                            <p class="header-sub">Sistema de Gestión Clínica e IA</p>
                        </td>
                        <td class="header-right" style="vertical-align: bottom;">
                            <b>EXPEDIENTE CLÍNICO AUTOMATIZADO</b><br>
                            <span style="color: #0F766E; font-weight: bold;">Folio: ${activeReport.serialNumber}</span><br>
                            Fecha de Emisión: ${fechaEmision}
                        </td>
                    </tr>
                </table>

                <h2>I. Datos Generales</h2>
                <table class="data-table">
                    <tr>
                        <td><span class="lbl">Paciente:</span><span class="val">${activeReport.patientName}</span></td>
                        <td><span class="lbl">Edad:</span><span class="val">${pInfo.edad || 'N/E'} años</span></td>
                    </tr>
                    <tr>
                        <td><span class="lbl">Teléfono:</span><span class="val">${pInfo.telefono || 'N/E'}</span></td>
                        <td><span class="lbl">Evaluador:</span><span class="val">Psicólogo Autorizado</span></td>
                    </tr>
                </table>

                <h2>II. Motivo de Consulta</h2>
                <p>${(repData.motivo_consulta || "No especificado.").replace(/\n/g, '<br>')}</p>

                <h2>III. Técnicas e Instrumentos Aplicados</h2>
                <p>${(repData.pruebas_aplicadas || "Entrevista clínica semiestructurada.").replace(/\n/g, '<br>')}</p>

                <h2>IV. Análisis y Observaciones Clínicas</h2>
                <p>${(repData.notas_psicologo || "").replace(/\n/g, '<br>')}</p>

                <h2>${esReporteSeguimiento ? 'V. Notas de Evolución Terapéutica' : 'V. Análisis Clínico y Fundamentación DSM-5'}</h2>
                ${!esReporteSeguimiento ? '<p style="font-size: 9pt; color: #64748b;"><i>* Sección procesada mediante ALMA AI (HorizonFlow Cognitive Module)</i></p>' : ''}
                <div>${analisisIA}</div>

                // VI. DIAGNÓSTICO CLÍNICO (Solo si no es seguimiento)
                ${!esReporteSeguimiento ? `
                <h2 class="section-title">VI. DIAGNÓSTICO CLÍNICO</h2>
                <table class="data-table">
                    <tr>
                        <td style="padding: 15px; text-align: center; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <!-- 🌟 EL ARREGLO PARA WORD: Data cruda -->
                            <strong>${activeReport.fullData.diagnostico_final}</strong>
                        </td>
                    </tr>
                </table>
                ` : ''}

                <h2>${esReporteSeguimiento ? 'VI. Plan a Seguir' : 'VII. Recomendaciones y Plan a Seguir'}</h2>
                ${!esReporteSeguimiento && repData.recomendaciones ? `<p>${repData.recomendaciones.replace(/\n/g, '<br>')}</p>` : ''}
                ${repData.plan_accion ? `<p><b>Plan de Acción Directo:</b><br>${repData.plan_accion}</p>` : ''}

                <table class="signatures">
                    <tr>
                        <td class="sig-td">
                            <div class="sig-line">Firma del Profesional</div>
                            <div class="sig-sub">Reg. Médico: Pendiente</div>
                        </td>
                        <td class="sig-td">
                            <div class="sig-line">Sello de la Clínica</div>
                            <div class="sig-sub">HorizonFlow Systems</div>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `;

            // Creamos un archivo en memoria
            const blob = new Blob(['\ufeff', htmlWord], { type: 'application/msword' });
            
            // Forzamos la descarga automática
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
           
            
            
            // 🌟 NUEVO: Nombramiento dinámico del archivo según el tipo de reporte
            const nombreFormateado = activeReport.patientName.replace(/\s+/g, '_');
            link.download = esReporteSeguimiento 
                ? `Seguimiento_Terapeutico_${nombreFormateado}.doc` 
                : `Informe_Psicologico_${nombreFormateado}.doc`;
                
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <>
                <div className="hidden print:block max-w-4xl mx-auto mb-8 w-full">
                    <div className="flex items-center justify-between border-b-2 border-[#0F766E] pb-6">
                        <div>
                            <h1 className="text-2xl font-black text-[#0F766E] tracking-tight uppercase">HorizonFlow</h1>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Sistema de Gestión Clínica e Inteligencia Artificial</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-[#113130]">EXPEDIENTE CLÍNICO AUTOMATIZADO</p>
                            {/* 🌟 NUEVO: Folio visible en el encabezado del PDF impreso */}
                            <p className="text-xs font-black text-[#0F766E] mt-0.5">FOLIO: {activeReport.serialNumber}</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">Fecha de Emisión: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <button 
                        onClick={() => setView('list')} 
                        className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-all bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md w-fit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg> 
                        CERRAR REPORTE
                    </button>

                    <div className="flex items-center gap-3">
                        {/* 🌟 NUEVO BOTÓN DE WORD */}
                        <button 
                            onClick={exportarAWord} 
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest transition-all px-6 py-2.5 rounded-xl shadow-md hover:shadow-xl"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            WORD
                        </button>

                        {/* BOTÓN ORIGINAL DE PDF */}
                        <button 
                            onClick={() => window.print()} 
                            className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-black uppercase tracking-widest transition-all px-6 py-2.5 rounded-xl shadow-md hover:shadow-xl"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            PDF
                        </button>
                    </div>
                </div>

                <div id="reporte-imprimible" className="bg-white rounded-[2rem] p-10 sm:p-16 shadow-2xl border border-slate-200 font-serif text-slate-800 relative max-w-4xl mx-auto">
                    <div className="leading-relaxed print:w-full">
                        
                        {/* I. DATOS GENERALES */}
                        <section className="print:break-inside-avoid mb-8 pb-2">
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">I. Datos Generales</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-6 rounded-2xl font-sans border border-slate-100">
                                <div><span className="font-bold text-slate-500 block mb-1">Paciente:</span> <span className="font-bold text-[#113130] text-base">{activeReport.patientName}</span></div>
                                {/* 🌟 NUEVO: Folio destacado en Datos Generales */}
                                <div><span className="font-bold text-slate-500 block mb-1">Folio Único de Expediente:</span> <span className="font-black text-[#0F766E] text-base">{activeReport.serialNumber}</span></div>
                                <div><span className="font-bold text-slate-500 block mb-1">Edad:</span> <span className="font-bold text-[#113130] text-base">{pInfo.edad || 'N/E'} años</span></div>
                                <div><span className="font-bold text-slate-500 block mb-1">Teléfono:</span> <span className="font-bold text-[#113130] text-base">{pInfo.telefono || 'N/E'}</span></div>
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

                        {/* V. ANÁLISIS / EVOLUCIÓN */}
                        <section className="print:break-inside-avoid mb-8 pb-2">
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">
                                {esReporteSeguimiento ? "V. Notas de Evolución Terapéutica" : "V. Análisis Clínico y Fundamentación DSM-5 "}
                            </h2>
                            <div className="text-[15px] text-justify text-slate-700 mb-6">
                                <TextoFormateadoIA texto={repData.analisis_ia} />
                            </div>
                        </section>

                        

                        {/* VI. DIAGNÓSTICO CLÍNICO (🌟 DESAPARECE SI ES SEGUIMIENTO) */}
                         {!esReporteSeguimiento && (
                            <section className="print:break-inside-avoid mb-8 pb-2">
                                <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">VI. Diagnóstico Clínico</h2>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                    {/* 🌟 EL ARREGLO: Leemos la base de datos original, no la tarjeta */}
                                    <span className="font-bold text-slate-700 text-lg">
                                        {activeReport.fullData.diagnostico_final}
                                    </span>
                                </div>
                            </section>
                        )}

                        {/* SECCIÓN DE RECOMENDACIONES Y PLAN DE ACCIÓN */}
                        <section className="print:break-inside-avoid mb-8 pb-2">
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">
                                {esReporteSeguimiento ? "VI. Plan a Seguir" : "VII. Recomendaciones y Plan a Seguir"}
                            </h2>
                            
                            {/* 🌟 AQUÍ ESTABA EL ERROR: Aseguramos que imprima el texto siempre */}
                            <p className="text-sm text-slate-700 leading-relaxed font-sans mb-6 text-justify">
                                {activeReport.fullData.recomendaciones || activeReport.recommendations || "Continuar con el proceso terapéutico."}
                            </p>
                            
                            {/* La cajita de la decisión clínica */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Decisión Clínica:
                                </div>
                                <div className="bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-lg uppercase tracking-wide">
                                    {activeReport.fullData?.plan_accion && activeReport.fullData.plan_accion !== "No especificado" 
                                        ? activeReport.fullData.plan_accion 
                                        : "SEGUIMIENTO TERAPÉUTICO"}
                                </div>
                            </div>
                        </section>

                        {/* FIRMAS (ÚNICAS Y ORIGINALES) */}
                        <div className="mt-20 pt-10 grid grid-cols-2 gap-10 font-sans print:break-inside-avoid">
                            <div className="border-t-2 border-slate-300 pt-4 text-center">
                                <p className="text-sm font-black text-[#113130] uppercase tracking-widest">Firma del Profesional</p>
                                <p className="text-xs text-slate-500 font-bold mt-1">Reg. Médico: Pendiente</p>
                            </div>
                            <div className="border-t-2 border-slate-300 pt-4 text-center opacity-50">
                                <p className="text-sm font-black text-[#113130] uppercase tracking-widest">Sello de la Clínica</p>
                                <p className="text-xs text-slate-500 font-bold mt-1">HorizonFlow Systems</p>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        );
    }
    
    return null;
};

// 🌟 Exportación envuelta en el Proveedor para blindar el componente contra fallas
export default function ReportesIntegrado(props) {
    return (
        <AlertaProvider>
            <Reportes {...props} />
        </AlertaProvider>
    );
}