import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import { useParams } from 'react-router-dom';
// import './Formulario.css'; // <-- DESCOMENTA ESTA LÍNEA EN TU VS CODE

const LogoSVG = ({ className }) => (
    <svg className={className} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 20 L50 60 L60 20 M30 30 L40 70 L50 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="75" y="45" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="currentColor" letterSpacing="-0.5">HorizonFlow</text>
        <text x="75" y="60" fontFamily="sans-serif" fontSize="10" fontWeight="600" fill="currentColor" letterSpacing="1" opacity="0.8">CLINICAL AI FOR MENTAL HEALTH</text>
    </svg>
);

// `Logo` usa `logo.png` si existe; de lo contrario hace fallback al SVG.
const Logo = ({ className, alt = 'HorizonFlow' }) => {
    if (logo) {
        return <img src={logo} alt={alt} className={`${className} object-contain`} />;
    }
    return <LogoSVG className={className} />;
};

const IconShield = () => (
    <svg className="w-6 h-6 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconClipboard = () => (
    <svg className="w-6 h-6 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export default function Formulario() {
    const { psicologoId } = useParams(); // 🌟 2. JALAMOS EL ID DE LA URL
    const [pasoActual, setPasoActual] = useState(1);

    // 🌟 3. RENOMBRAMOS LAS VARIABLES PARA FASTAPI
    const [respuestas, setRespuestas] = useState({
        q1_satisfaccion_general: 0,
        q5_instalaciones: 0,
        q2_cumplimiento_expectativas: '',
        q3_empatia_conexion: '',
        q6_claridad_pautas: '',
        q7_impacto_animo: '',
        q9_indice_recomendacion: '',
        q8_confianza_seguridad: '',
        q4_aspectos_valorados: [], // Lo dejamos como array para que funcione su diseño
        q10_comentarios: ''
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pasoActual]);

    // Función para manejar las escalas del 1 al 5
    const handleRating = (pregunta, valor) => {
        setRespuestas(prev => ({ ...prev, [pregunta]: valor }));
    };

    // Función para botones de selección única
    const handleSeleccion = (pregunta, valor) => {
        setRespuestas(prev => ({ ...prev, [pregunta]: valor }));
    };

    // Función especial para checkboxes (permite seleccionar y deseleccionar múltiples)
    const handleSeleccionMultiple = (pregunta, valor) => {
        setRespuestas(prev => {
            const actuales = prev[pregunta];
            if (actuales.includes(valor)) {
                return { ...prev, [pregunta]: actuales.filter(item => item !== valor) };
            } else {
                return { ...prev, [pregunta]: [...actuales, valor] };
            }
        });
    };

    // Envío del formulario completo
    // 🌟 4. EL ENVÍO REAL A LA BASE DE DATOS
    // Envío del formulario completo
    const handleSubmit = async (e) => { 
        e.preventDefault();
        
        // Validación
        const faltanEscalas = ['q1_satisfaccion_general', 'q5_instalaciones'].some(key => respuestas[key] === 0);
        const faltanSeleccionesUnicas = ['q2_cumplimiento_expectativas', 'q3_empatia_conexion', 'q6_claridad_pautas', 'q7_impacto_animo', 'q9_indice_recomendacion', 'q8_confianza_seguridad'].some(key => respuestas[key] === '');
        const faltanSeleccionesMultiples = respuestas.q4_aspectos_valorados.length === 0;
        
        if (faltanEscalas || faltanSeleccionesUnicas || faltanSeleccionesMultiples) {
            alert("Por favor, responda todas las preguntas (excepto las opcionales) antes de enviar el formulario.");
            return;
        }

        try {
            // 🌟 NUEVO: Diccionarios para traducir las opciones largas de la UI a las opciones cortas del Dashboard
            const mapeoQ4 = {
                'La escucha activa y empatía del psicólogo': 'Escucha activa y empatía',
                'La claridad de las explicaciones y herramientas brindadas': 'Claridad de explicaciones',
                'La privacidad y comodidad del espacio terapéutico': 'Privacidad del espacio',
                'La puntualidad de la cita': 'Puntualidad'
            };

            const mapeoQ7 = {
                'Mucho mejor, me siento con mayor claridad': 'Mucho mejor',
                'Algo mejor, me siento escuchado(a)': 'Algo mejor',
                'Igual que al llegar': 'Igual',
                'Peor / Más confundido(a)': 'Peor'
            };

            // Convertimos el array de Q4 a los textos cortos y los unimos por comas
            const q4_traducido = respuestas.q4_aspectos_valorados.map(item => mapeoQ4[item]).join(', ');
            
            // Convertimos la respuesta única de Q7 a su texto corto
            const q7_traducido = mapeoQ7[respuestas.q7_impacto_animo];

            const datosAEnviar = {
                ...respuestas,
                q4_aspectos_valorados: q4_traducido,
                q7_impacto_animo: q7_traducido
            };

            const res = await fetch(`http://127.0.0.1:8000/encuestas/publica/${psicologoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosAEnviar)
            });

            if (res.ok) {
                setPasoActual(3);
            } else {
                const errorData = await res.json();
                console.error("Error Backend:", errorData);
                alert("Hubo un problema al guardar la encuesta.");
            }
        } catch (error) {
            console.error("Error de Red:", error);
            alert("El servidor no responde, revisá tu conexión.");
        }
    };

    const EscalaPuntuacion = ({ preguntaId }) => {
        return (
            <div className="flex justify-between items-center w-full gap-1.5 sm:gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = respuestas[preguntaId] === num;
                    return (
                        <button
                            key={num}
                            type="button"
                            onClick={() => handleRating(preguntaId, num)}
                            className={`flex-1 h-12 rounded-lg text-base font-bold transition-all duration-200 border ${
                                isSelected 
                                ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-md transform scale-[1.02]' 
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-teal-50 hover:border-[#0D9488] hover:text-[#0D9488]'
                            }`}
                        >
                            {num}
                        </button>
                    );
                })}
            </div>
        );
    };

    const OpcionesMultiples = ({ preguntaId, opciones }) => {
        return (
            <div className="flex flex-col gap-2 mt-4">
                {opciones.map((opcion, idx) => {
                    const isSelected = respuestas[preguntaId] === opcion;
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSeleccion(preguntaId, opcion)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                isSelected 
                                ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#0F766E]' : 'border-slate-300'}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#0F766E]"></div>}
                                </div>
                                {opcion}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    const OpcionesMultiplesCheckbox = ({ preguntaId, opciones }) => {
        return (
            <div className="flex flex-col gap-2 mt-4">
                {opciones.map((opcion, idx) => {
                    const isSelected = respuestas[preguntaId].includes(opcion);
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSeleccionMultiple(preguntaId, opcion)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                isSelected 
                                ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#0F766E] border-[#0F766E]' : 'bg-white border-slate-300'}`}>
                                    {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                {opcion}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    if (pasoActual === 3) {
        return (
            <div className="min-h-screen bg-[#F4F8F8] flex flex-col items-center justify-center p-6 font-sans">
                <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-100 animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-emerald-50/50">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#113130] mb-3">Evaluación Recibida</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-8">
                        Agradecemos profundamente su tiempo. Sus respuestas han sido registradas de forma confidencial y serán utilizadas exclusivamente para mantener nuestros estándares de excelencia clínica.
                    </p>
                    <button 
                        onClick={() => window.close()} 
                        className="w-full py-3.5 bg-[#0F766E] text-white rounded-xl font-semibold text-sm hover:bg-[#0D9488] transition-colors shadow-sm"
                    >
                        Finalizar y cerrar
                    </button>
                </div>
            </div>
        );
    }

    if (pasoActual === 1) {
        return (
            <div className="min-h-screen bg-[#F4F8F8] font-sans flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    
                    {/* Encabezado Institucional */}
                    <div className="bg-[#113130] py-10 px-8 flex flex-col items-center text-center relative">
                        <LogoSVG className="h-16 w-auto text-white drop-shadow-lg mb-4" />
                        <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">Protocolo de Calidad Asistencial</h1>
                        <div className="h-px w-16 bg-teal-500/50 my-3"></div>
                        <p className="text-teal-100/90 text-xs uppercase tracking-widest font-semibold">
                            Evaluación Confidencial del Paciente
                        </p>
                    </div>

                    <div className="p-8 sm:p-10">
                        <h2 className="text-xl font-bold text-[#113130] mb-5 border-b border-slate-100 pb-4">
                            Estimado(a) Paciente,
                        </h2>
                        
                        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                            <p>
                                Con el firme propósito de garantizar la mejora continua en nuestros servicios de salud mental, le invitamos a participar en este proceso de retroalimentación. Su opinión es la herramienta más valiosa para asegurar que nuestros estándares de atención clínica cumplan con sus expectativas.
                            </p>
                            
                            <div className="grid gap-4 sm:grid-cols-2 mt-4">
                                {/* Tarjeta: Confidencialidad */}
                                <div className="flex flex-col gap-2 bg-teal-50/50 p-5 rounded-2xl border border-teal-100/50">
                                    <IconShield />
                                    <h3 className="font-bold text-[#0F766E]">Secreto Médico y Anonimato</h3>
                                    <p className="text-xs text-slate-600">
                                        Sus respuestas serán procesadas de manera <strong>estrictamente confidencial</strong>. El sistema consolida los datos estadísticamente, desvinculándolos por completo de su expediente clínico o identidad.
                                    </p>
                                </div>

                                {/* Tarjeta: Instrucciones */}
                                <div className="flex flex-col gap-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <IconClipboard />
                                    <h3 className="font-bold text-slate-700">Instrucciones de Llenado</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        El formulario consta de <strong>10 breves preguntas</strong>. Encontrará preguntas de selección única, opciones donde puede <strong>marcar múltiples respuestas</strong>, y escalas numéricas donde:<br/>
                                        <span className="inline-block mt-2 font-medium text-rose-600 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100 text-[10px] uppercase">1 = Deficiente / En Desacuerdo</span><br/>
                                        <span className="inline-block mt-1 font-medium text-[#0F766E] bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100 text-[10px] uppercase">5 = Excelente / De Acuerdo</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <button 
                                onClick={() => setPasoActual(2)}
                                className="w-full bg-[#113130] text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-lg hover:bg-[#0F766E] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <span>Iniciar Evaluación</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F8F8] font-sans pb-16 animate-fade-in">
            
            {/* Barra de navegación superior fija */}
            <header className="bg-white py-4 px-4 sm:px-6 shadow-sm sticky top-0 z-50 border-b border-slate-200 flex items-center justify-between">
                <LogoSVG className="h-7 sm:h-8 w-auto text-[#113130]" />
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => setPasoActual(1)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0F766E] transition-colors bg-slate-50 hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        <span className="hidden sm:inline">Ver instructivo</span>
                        <span className="sm:hidden">Volver</span>
                    </button>
                    <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">Evaluación Confidencial</span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SECCIÓN 1: Evaluación Clínica */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xs font-black text-[#0F766E] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Evaluación Clínica General</h3>
                        
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#113130] mb-2">1. Indique su nivel de satisfacción general con el servicio brindado por el psicólogo hoy.</label>
                            <EscalaPuntuacion preguntaId="q1_satisfaccion_general" />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#113130] mb-2">2. ¿La atención brindada por el especialista cumplió con sus expectativas previas a la consulta?</label>
                            <OpcionesMultiples 
                                preguntaId="q2_cumplimiento_expectativas" 
                                opciones={['Superó ampliamente mis expectativas', 'Cumplió totalmente mis expectativas', 'Cumplió parcialmente', 'No cumplió mis expectativas']} 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#113130] mb-2">3. ¿El especialista demostró trato respetuoso, empatía y escucha activa durante su intervención?</label>
                            <OpcionesMultiples 
                                preguntaId="q3_empatia_conexion" 
                                opciones={['Sí, en todo momento', 'La mayor parte del tiempo', 'Solo en algunos momentos', 'No, me sentí poco comprendido(a)']} 
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 2: Experiencia e Instalaciones */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xs font-black text-[#0F766E] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Experiencia en Consultorio</h3>
                        
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#113130] mb-1">4. ¿Qué aspecto(s) valora más de la atención médica recibida el día de hoy?</label>
                            <p className="text-xs text-slate-500 mb-2 font-medium">Puede seleccionar más de una opción.</p>
                            <OpcionesMultiplesCheckbox 
                                preguntaId="q4_aspectos_valorados" 
                                opciones={[
                                    'La escucha activa y empatía del psicólogo', 
                                    'La claridad de las explicaciones y herramientas brindadas', 
                                    'La puntualidad de la cita', 
                                    'La privacidad y comodidad del espacio terapéutico'
                                ]} 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#113130] mb-2">5. Indique su nivel de satisfacción con la comodidad, tranquilidad e higiene de las instalaciones.</label>
                            <EscalaPuntuacion preguntaId="q5_instalaciones" />
                        </div>
                    </div>

                    {/* SECCIÓN 3: Impacto y Recomendación */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xs font-black text-[#0F766E] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Impacto y Recomendación</h3>
                        
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#113130] mb-2">6. ¿Considera que las explicaciones o pautas abordadas hoy le resultaron claras y útiles para su proceso?</label>
                            <OpcionesMultiples 
                                preguntaId="q6_claridad_pautas" 
                                opciones={[
                                    'Totalmente claras y fáciles de aplicar', 
                                    'Claras en su mayoría', 
                                    'Me quedaron algunas dudas sobre cómo aplicarlas', 
                                    'Fueron confusas o poco claras'
                                ]} 
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#113130] mb-2">7. En comparación al inicio de la sesión, ¿cómo describiría su estado de ánimo al finalizar?</label>
                            <OpcionesMultiples 
                                preguntaId="q7_impacto_animo" 
                                opciones={['Mucho mejor, me siento con mayor claridad', 'Algo mejor, me siento escuchado(a)', 'Igual que al llegar', 'Peor / Más confundido(a)']} 
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#113130] mb-2">8. ¿Sintió que el consultorio brindaba el ambiente de confianza y seguridad necesario para expresarse libremente?</label>
                            <OpcionesMultiples 
                                preguntaId="q8_confianza_seguridad" 
                                opciones={[
                                    'Sí, me sentí completamente seguro(a) y en confianza', 
                                    'En su mayor parte me sentí cómodo(a)', 
                                    'Me costó un poco abrirme en este espacio', 
                                    'No me sentí seguro(a) ni en confianza'
                                ]} 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#113130] mb-2">9. ¿Qué tan probable es que recomiende a este especialista a un familiar o amigo que necesite apoyo psicológico?</label>
                            <OpcionesMultiples 
                                preguntaId="q9_indice_recomendacion" 
                                opciones={['Definitivamente lo recomendaría', 'Probablemente lo recomendaría', 'Poco probable', 'Definitivamente no lo recomendaría']} 
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 4: Abierta */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <label className="block text-sm font-bold text-[#113130] mb-2">
                            10. Sugerencias y Oportunidades de Mejora <span className="text-slate-400 font-normal text-xs ml-1">(Opcional)</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-4">¿Qué sugerencias nos podría dar para mejorar continuamente la atención en el consultorio?</p>
                        <textarea 
                            value={respuestas.q10_comentarios}
                            onChange={(e) => setRespuestas(prev => ({ ...prev, q10_comentarios: e.target.value }))}
                            placeholder="Describa de forma libre sus sugerencias o lo que más le agradó..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all resize-none h-32"
                        />
                    </div>

                    {/* Botón de Enviar Final */}
                    <div className="pt-4 pb-8">
                        <button 
                            type="submit"
                            className="w-full bg-[#0F766E] text-white font-bold text-sm tracking-widest uppercase py-5 rounded-xl shadow-lg hover:bg-[#0D9488] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <span>Enviar Evaluación de Calidad</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        <div className="text-center text-xs font-bold text-slate-400 mt-5 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                            <IconShield />
                            Información Protegida por HorizonFlow
                        </div>
                    </div>

                </form>
            </main>
            
            {/* NOTA: Esta etiqueta style se incluyó ÚNICAMENTE para que la vista previa aquí no marque error. 
                En tu VS Code puedes borrar toda esta etiqueta <style> porque ya tienes tu import './Formulario.css'. */}
            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}