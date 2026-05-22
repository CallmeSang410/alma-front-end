import React, { useState } from 'react';
import './Reportes.css';

const Reportes = () => {
   

    // ================= ESTADOS GENERALES =================
    const [view, setView] = useState('list'); // 'list' | 'wizard' | 'reportDetail'
    const [searchQuery, setSearchQuery] = useState('');
    const [activeReport, setActiveReport] = useState(null);

    // ================= DATOS DE PRUEBA (HISTORIAL) =================
    const [pastReports, setPastReports] = useState([
        { id: 1, serialNumber: "CD-0002", patientName: "Carlos Pérez", date: "2026-05-15", diagnosis: "Trastorno de Ansiedad Generalizada", nextStep: "Tratamiento Terapéutico", status: "Cerrado" },
        { id: 2, serialNumber: "CD-0001", patientName: "María José Castillo", date: "2026-03-10", diagnosis: "Episodio Depresivo Leve (Remisión)", nextStep: "Alta Médica", status: "Cerrado" }
    ]);

    // ================= ESTADOS DEL WIZARD (PASO A PASO) =================
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isEditingAI, setIsEditingAI] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Datos del Formulario de Evaluación
    const initialFormState = {
        patientName: '', age: '', sex: 'Masculino', reason: '', 
        interviewNotes: '', testsUsed: [], otherTestDescription: '', 
        aiHypothesis: '',
        finalDiagnosis: '', recommendations: '', nextStep: 'Tratamiento Terapéutico',
        otherNextStepDescription: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Tests Psicométricos disponibles
    const availableTests = ["BDI-II (Depresión)", "GAD-7 (Ansiedad)", "MMPI-2", "Test de Rorschach", "Test de Bender", "Test de la Figura Humana", "Escala de Estrés Percibido", "Otros"];

    // ================= FUNCIONES DEL WIZARD =================
    const handleNextStep = () => {
        const errors = {};
        
        // Validación por pasos
        if (step === 1) {
            if (!formData.patientName.trim()) errors.patientName = true;
            if (!formData.age.trim()) errors.age = true;
            if (!formData.reason.trim()) errors.reason = true;
        } else if (step === 2) {
            if (!formData.interviewNotes.trim()) errors.interviewNotes = true;
            if (formData.testsUsed.length === 0) errors.testsUsed = true;
            // Valida que si seleccionó "Otros", el campo de descripción no esté vacío
            if (formData.testsUsed.includes("Otros") && !formData.otherTestDescription.trim()) errors.otherTestDescription = true;
        } else if (step === 4) {
            if (!formData.finalDiagnosis.trim()) errors.finalDiagnosis = true;
            if (!formData.recommendations.trim()) errors.recommendations = true;
            if (formData.nextStep === 'Otros' && !formData.otherNextStepDescription.trim()) errors.otherNextStepDescription = true;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        
        // Flujo del Wizard
        if (step === 2) {
            setStep(3);
            simulateAI();
        } else if (step < 4) {
            setStep(step + 1);
        } else {
            finalizeReport();
        }
    };

    const handlePrevStep = () => {
        setFormErrors({});
        if (step > 1) setStep(step - 1);
    };

    const toggleTest = (test) => {
        setFormErrors({...formErrors, testsUsed: false}); 
        if (formData.testsUsed.includes(test)) {
            setFormData({ 
                ...formData, 
                testsUsed: formData.testsUsed.filter(t => t !== test),
                // Si desmarca "Otros", limpiamos la descripción
                otherTestDescription: test === "Otros" ? '' : formData.otherTestDescription 
            });
        } else {
            setFormData({ ...formData, testsUsed: [...formData.testsUsed, test] });
        }
    };

    const simulateAI = () => {
        setIsAnalyzing(true);
        setIsEditingAI(false); // Resetea el modo edición al analizar
        
        setTimeout(() => {
            setIsAnalyzing(false);
            
            // Construimos una respuesta que incluya el test "Otros" si se usó
            let testsString = formData.testsUsed.filter(t => t !== 'Otros').join(', ');
            if (formData.testsUsed.includes('Otros') && formData.otherTestDescription) {
                testsString += (testsString ? ' y ' : '') + `evaluación clínica basada en: ${formData.otherTestDescription}`;
            }

            setFormData(prev => ({
                ...prev,
                aiHypothesis: `Basado en el motivo de consulta ("${prev.reason}") y las notas de la entrevista, correlacionado con los instrumentos aplicados (${testsString || 'evaluación general'}), los patrones sintomatológicos sugieren un cuadro clínico compatible con marcadores de alteración emocional.\n\nEvidencia detectada:\n- Congruencia entre el motivo de consulta y la observación en sesión.\n- Puntuación clínica o indicadores relevantes en los instrumentos utilizados.\n\nSugerencia Clínica: Descartar etiología orgánica, confirmar diagnóstico diferencial y orientar el abordaje terapéutico a la estabilización de los síntomas principales.`
            }));
        }, 3000);
    };

    const finalizeReport = () => {
        // Generador de número de serie distintivo (Ej. CD-0003)
        const nextNumber = pastReports.length + 1;
        const newSerialNumber = `CD-${String(nextNumber).padStart(4, '0')}`;

        const newReport = {
            id: Date.now(),
            serialNumber: newSerialNumber,
            patientName: formData.patientName,
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            diagnosis: formData.finalDiagnosis,
            nextStep: formData.nextStep,
            status: "Cerrado",
            fullData: formData 
        };
        setPastReports([newReport, ...pastReports]);
        setView('list');
        setStep(1);
        setFormData(initialFormState);
    };

    // ================= HELPERS VISUALES =================
    const ErrorIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    );

    const getStepTitle = (s) => {
        switch(s) {
            case 1: return "Datos Iniciales";
            case 2: return "Evaluación Clínica";
            case 3: return "Análisis HorizonFlow";
            case 4: return "Cierre y Diagnóstico";
            default: return "";
        }
    };

    // Colores dinámicos para las decisiones finales
    const getBadgeStyle = (stepName) => {
        if (!stepName) return 'bg-slate-100 text-slate-600';
        if (stepName.includes('Alta')) return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        if (stepName.includes('Derivación')) return 'bg-purple-100 text-purple-800 border border-purple-200';
        if (stepName.includes('Interconsulta')) return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
        if (stepName.includes('Seguimiento')) return 'bg-amber-100 text-amber-800 border border-amber-200';
        if (stepName === 'Otros') return 'bg-slate-100 text-slate-700 border border-slate-300';
        return 'bg-blue-100 text-blue-800 border border-blue-200';
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
                        Iniciar Nueva Evaluación
                    </button>
                </div>

                <div className="relative w-full">
                    <input type="text" placeholder="Buscar por paciente, diagnóstico o Folio (Ej. CD-0001)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all font-medium shadow-sm" />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

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
                                    {report.nextStep === 'Otros' ? report.fullData.otherNextStepDescription : report.nextStep}
                                </span>
                                <span className="text-[#0F766E] font-bold text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                    Ver Informe <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ================= VISTA 2: WIZARD DE EVALUACIÓN (PASO A PASO) =================
    if (view === 'wizard') {
        return (
            <div className="max-w-4xl mx-auto space-y-6 relative animate-fade-in pb-10">
                
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Cancelar
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paso {step} de 4</span>
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    
                    <div className="flex gap-2 mb-10">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#0F766E]' : 'bg-slate-100'}`}></div>
                        ))}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-[#113130] tracking-tight">{getStepTitle(step)}</h2>
                        <p className="text-sm text-slate-500 font-medium mt-2">
                            {step === 1 && "Ingresa la información básica y el motivo por el cual el paciente asiste a consulta."}
                            {step === 2 && "Documenta la entrevista, observaciones y las herramientas psicométricas aplicadas."}
                            {step === 3 && "HorizonFlow está cruzando la información clínica para generar una hipótesis diagnóstica. Revísala y edítala si es necesario."}
                            {step === 4 && "Confirma tu diagnóstico final clínico y define el plan de acción terapéutico."}
                        </p>
                    </div>

                    {/* CONTENIDO DEL PASO 1 */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Paciente</label>
                                    <input type="text" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} placeholder="Ej. Juan Pérez..." className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.patientName ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} />
                                    {formErrors.patientName && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edad</label>
                                        <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="30" className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.age ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`} />
                                        {formErrors.age && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Obligatorio</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sexo</label>
                                        <select value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all">
                                            <option>Masculino</option><option>Femenino</option><option>Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Motivo de Consulta (Textual del paciente)</label>
                                <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Ej. 'Siento mucha presión en el pecho y no puedo dormir...'" rows="3" className={`w-full rounded-2xl px-5 py-4 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 transition-all resize-none ${formErrors.reason ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`}></textarea>
                                {formErrors.reason && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Especifica el motivo de consulta</p>}
                            </div>
                        </div>
                    )}

                    {/* CONTENIDO DEL PASO 2 */}
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

                            {/* Campo Condicional "Otros" */}
                            {formData.testsUsed.includes("Otros") && (
                                <div className="animate-fade-in bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Especificar Otro Instrumento y Base Teórica
                                    </label>
                                    <textarea 
                                        value={formData.otherTestDescription} 
                                        onChange={(e) => setFormData({...formData, otherTestDescription: e.target.value})} 
                                        placeholder="Ej. Inventario de Ansiedad de Beck (BAI). Se utilizó para corroborar sintomatología somática..." 
                                        rows="3" 
                                        className={`w-full rounded-xl px-4 py-3 text-sm font-medium text-[#113130] focus:outline-none focus:ring-2 transition-all resize-none ${formErrors.otherTestDescription ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-white border-slate-200 focus:ring-[#0F766E] border'}`}
                                    ></textarea>
                                    {formErrors.otherTestDescription && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Debes describir el instrumento utilizado</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONTENIDO DEL PASO 3 (ANÁLISIS IA Y EDICIÓN) */}
                    {step === 3 && (
                        <div className="animate-fade-in relative">
                            {isAnalyzing ? (
                                <div className="py-20 text-center flex flex-col items-center justify-center space-y-6">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-[#0F766E] rounded-full border-t-transparent animate-spin"></div>
                                        <svg className="w-10 h-10 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#113130] animate-pulse">HorizonFlow está evaluando...</h3>
                                        <p className="text-sm text-slate-500 mt-2">Correlacionando notas clínicas con instrumentos aplicados.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                    <div className={`bg-[#113130] text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl transition-all duration-300 ${isEditingAI ? 'ring-4 ring-teal-500/40 bg-slate-900' : ''}`}>
                                        <div className="absolute inset-0 ai-scanning opacity-10 pointer-events-none"></div>
                                        <div className="relative z-10">
                                            
                                            {/* Header con botón de edición */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-white/10 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black tracking-wide text-teal-50">Hipótesis Diagnóstica HorizonFlow</h3>
                                                        <p className="text-[10px] text-teal-200/60 uppercase tracking-widest font-bold mt-0.5">Procesamiento Clínico Activo</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setIsEditingAI(!isEditingAI)}
                                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isEditingAI ? 'bg-teal-500 text-white shadow-lg shadow-teal-900/50' : 'bg-white/10 text-teal-100 hover:bg-white/20'}`}
                                                >
                                                    {isEditingAI ? (
                                                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Guardar Cambios</>
                                                    ) : (
                                                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Editar Hipótesis</>
                                                    )}
                                                </button>
                                            </div>
                                            
                                            {/* Texto Editable vs Texto Estático */}
                                            {isEditingAI ? (
                                                <textarea 
                                                    value={formData.aiHypothesis} 
                                                    onChange={(e) => setFormData({...formData, aiHypothesis: e.target.value})}
                                                    rows="8"
                                                    autoFocus
                                                    className="w-full bg-[#113130] border border-teal-500/50 rounded-xl p-5 text-teal-50 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:border-teal-400 transition-all shadow-inner"
                                                ></textarea>
                                            ) : (
                                                <p className="w-full text-teal-50 text-sm font-medium leading-relaxed whitespace-pre-wrap px-1">
                                                    {formData.aiHypothesis}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold text-center flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Recuerda: Este texto es una sugerencia. Revísalo y modifícalo antes de generar el informe final.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONTENIDO DEL PASO 4 (CIERRE) */}
                    {step === 4 && (
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
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {['Tratamiento Terapéutico', 'Seguimiento Mensual', 'Alta Médica'].map((option) => (
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
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Especificar Otra Decisión o Plan a Seguir
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.otherNextStepDescription} 
                                            onChange={(e) => setFormData({...formData, otherNextStepDescription: e.target.value})} 
                                            placeholder="Ej. Ingreso a programa de rehabilitación..." 
                                            className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.otherNextStepDescription ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border'}`}
                                        />
                                        {formErrors.otherNextStepDescription && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Debes describir la acción a seguir</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botonera del Wizard */}
                    <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                        <button 
                            onClick={handlePrevStep}
                            disabled={step === 1 || isAnalyzing || isEditingAI}
                            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Atrás
                        </button>
                        <button 
                            onClick={handleNextStep}
                            disabled={isAnalyzing || isEditingAI}
                            className="px-8 py-3.5 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {step === 4 ? (
                                <>Generar Informe <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg></>
                            ) : (
                                <>Siguiente <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // ================= VISTA 3: INFORME FINAL (DOCUMENTO) =================
    if (view === 'reportDetail' && activeReport) {
        const data = activeReport.fullData || initialFormState;

        return (
            <div className="max-w-4xl mx-auto space-y-6 relative animate-fade-in pb-10">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Volver
                    </button>
                    <button className="flex items-center gap-2 text-white bg-slate-800 hover:bg-slate-900 text-xs font-black uppercase tracking-widest transition-colors px-6 py-2.5 rounded-xl shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Imprimir PDF
                    </button>
                </div>

                {/* Hoja de Reporte Tipo Documento Clínico */}
                <div className="bg-white rounded-[2rem] p-10 sm:p-16 shadow-2xl border border-slate-200 font-serif text-slate-800 relative">
                    {/* Header del Documento */}
                    <div className="border-b-2 border-[#113130] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-[#113130] font-sans tracking-tight">INFORME CLÍNICO</h1>
                            <p className="text-sm font-bold text-[#0F766E] tracking-widest uppercase mt-2 font-sans flex items-center gap-2">
                                Folio: {activeReport.serialNumber} 
                            </p>
                        </div>
                        <div className="text-right font-sans">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha de Emisión</p>
                            <p className="text-sm font-bold text-[#113130]">{activeReport.date}</p>
                        </div>
                    </div>

                    <div className="space-y-8 leading-relaxed">
                        {/* 1. Datos Generales */}
                        <section>
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">I. Datos Generales</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-6 rounded-2xl font-sans border border-slate-100">
                                <div><span className="font-bold text-slate-500 block mb-1">Paciente:</span> <span className="font-bold text-[#113130] text-base">{activeReport.patientName}</span></div>
                                <div><span className="font-bold text-slate-500 block mb-1">Edad:</span> <span className="font-bold text-[#113130] text-base">{data.age || '34'} años</span></div>
                                <div><span className="font-bold text-slate-500 block mb-1">Sexo:</span> <span className="font-bold text-[#113130] text-base">{data.sex || 'No especificado'}</span></div>
                                <div><span className="font-bold text-slate-500 block mb-1">Evaluador:</span> <span className="font-bold text-[#113130] text-base">Dr. Administrador</span></div>
                            </div>
                        </section>

                        {/* 2. Motivo de Consulta */}
                        <section>
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">II. Motivo de Consulta</h2>
                            <p className="text-[15px] italic border-l-4 border-teal-500 pl-5 py-2 text-slate-600 bg-teal-50/30 rounded-r-xl">
                                "{data.reason || 'El paciente asiste a consulta refiriendo síntomas asociados a su condición actual, buscando una evaluación clínica especializada.'}"
                            </p>
                        </section>

                        {/* 3. Técnicas e Instrumentos */}
                        <section>
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">III. Técnicas e Instrumentos Aplicados</h2>
                            <ul className="list-disc pl-5 text-[15px] space-y-1.5 text-slate-700">
                                <li>Entrevista Psicológica Clínica.</li>
                                {data.testsUsed && data.testsUsed.length > 0 ? (
                                    data.testsUsed.map((t, i) => (
                                        <li key={i}>
                                            {t === 'Otros' && data.otherTestDescription ? <><span className="font-bold">Instrumento Adicional:</span> {data.otherTestDescription}</> : t}
                                        </li>
                                    ))
                                ) : (
                                    <li>Evaluación psicométrica estándar (Archivo).</li>
                                )}
                            </ul>
                        </section>

                        {/* 4. Conclusiones y Análisis */}
                        <section>
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">IV. Análisis y Observaciones Clínicas</h2>
                            <p className="text-[15px] text-justify text-slate-700">
                                Durante el desarrollo de la entrevista, el paciente se mostró cooperativo. {data.interviewNotes || 'Se observaron indicadores clínicos congruentes con la sintomatología reportada, manteniendo un afecto adecuado y lenguaje coherente.'}
                            </p>
                            
                            {data.aiHypothesis && (
                                <div className="mt-6 bg-[#113130] p-6 rounded-2xl border border-teal-900 font-sans shadow-lg">
                                    <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Análisis Clínico y Diagnóstico Presuntivo (Evaluado y Editado)
                                    </p>
                                    <p className="text-[13px] text-teal-50 leading-relaxed whitespace-pre-wrap">{data.aiHypothesis}</p>
                                </div>
                            )}
                        </section>

                        {/* 5. Diagnóstico Final */}
                        <section>
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">V. Diagnóstico Clínico</h2>
                            <p className="text-xl font-bold text-[#113130] bg-slate-50 p-5 rounded-2xl text-center font-sans border border-slate-200 shadow-inner">
                                {activeReport.diagnosis}
                            </p>
                        </section>

                        {/* 6. Recomendaciones */}
                        <section>
                            <h2 className="text-sm font-black text-[#113130] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 font-sans">VI. Recomendaciones y Plan a Seguir</h2>
                            <p className="text-[15px] whitespace-pre-wrap text-slate-700 mb-6">
                                {data.recommendations || 'Se sugiere apego a la pauta terapéutica y realizar monitoreo constante de los síntomas reportados.'}
                            </p>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans w-fit">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Decisión Clínica:</span>
                                <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm ${getBadgeStyle(activeReport.nextStep)}`}>
                                    {activeReport.nextStep === 'Otros' ? activeReport.fullData.otherNextStepDescription : activeReport.nextStep}
                                </span>
                            </div>
                        </section>

                    </div>
                    
                    {/* Firmas */}
                    <div className="mt-24 pt-10 grid grid-cols-2 gap-10 font-sans">
                        <div className="border-t-2 border-slate-300 pt-4 text-center">
                            <p className="text-sm font-black text-[#113130] uppercase tracking-widest">Firma del Profesional</p>
                            <p className="text-xs text-slate-500 font-bold mt-1">Reg. Médico: 123456-HF</p>
                        </div>
                        <div className="border-t-2 border-slate-300 pt-4 text-center opacity-50">
                            <p className="text-sm font-black text-[#113130] uppercase tracking-widest">Sello de la Clínica</p>
                            <p className="text-xs text-slate-500 font-bold mt-1">HorizonFlow Systems</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Reportes;