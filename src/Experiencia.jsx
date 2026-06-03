import React, { useState } from 'react';
import './Experiencia.css'; 

// --- ÍCONOS VECTORIALES ---
const IconStar = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

const IconUsers = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const IconTrending = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

// --- DATOS SIMULADOS (Estructura lista para reemplazar con Fetch/Axios) ---
const estadisticas = {
    // KPIs Generales
    total_evaluaciones: 142,
    promedio_satisfaccion: 4.8,
    porcentaje_recomendacion: 94, 
    
    // Q1 a Q10 en orden estricto
    Q1_satisfaccion: [
        { label: '5 Estrellas (Excelente)', count: 110, color: 'bg-emerald-500' },
        { label: '4 Estrellas (Bueno)', count: 25, color: 'bg-teal-400' },
        { label: '3 Estrellas (Regular)', count: 5, color: 'bg-amber-400' },
        { label: '2 Estrellas (Malo)', count: 2, color: 'bg-orange-400' },
        { label: '1 Estrella (Pésimo)', count: 0, color: 'bg-rose-500' }
    ],
    Q2_expectativas: [
        { label: 'Superó ampliamente', count: 85, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'Cumplió totalmente', count: 45, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Cumplió parcialmente', count: 10, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'No cumplió', count: 2, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q3_empatia: [
        { label: 'Sí, en todo momento', count: 120, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'La mayor parte', count: 15, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Solo a veces', count: 5, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'No, me sentí incomprendido', count: 2, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q4_aspectos: [
        { label: 'Escucha activa y empatía', count: 130, color: 'bg-[#0F766E]' },
        { label: 'Claridad de explicaciones', count: 115, color: 'bg-[#0F766E]' },
        { label: 'Privacidad del espacio', count: 98, color: 'bg-[#0F766E]' },
        { label: 'Puntualidad', count: 82, color: 'bg-[#0F766E]' }
    ],
    Q5_instalaciones: [
        { label: '5 Estrellas', count: 125, color: 'bg-emerald-500' },
        { label: '4 Estrellas', count: 12, color: 'bg-teal-400' },
        { label: '3 Estrellas', count: 5, color: 'bg-amber-400' },
        { label: '1 - 2 Estrellas', count: 0, color: 'bg-rose-500' }
    ],
    Q6_claridad: [
        { label: 'Totalmente claras', count: 95, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'Claras en su mayoría', count: 35, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Me quedaron dudas', count: 10, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'Fueron confusas', count: 2, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q7_animo: [
        { label: 'Mucho mejor', count: 98, color: 'bg-emerald-500' },
        { label: 'Algo mejor', count: 35, color: 'bg-teal-400' },
        { label: 'Igual', count: 7, color: 'bg-slate-300' },
        { label: 'Peor', count: 2, color: 'bg-rose-400' }
    ],
    Q8_confianza: [
        { label: 'Completamente seguro', count: 115, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'En su mayor parte', count: 20, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Me costó abrirme', count: 7, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'No me sentí seguro', count: 0, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q9_recomendacion: [
        { label: 'Definitivamente', count: 133, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'Probablemente', count: 7, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Poco probable', count: 2, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'Definitivamente no', count: 0, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q10_comentarios: [
        { id: 1, fecha: 'Hoy, 10:30 AM', texto: 'Me sentí muy seguro hablando de mis problemas. El consultorio transmite mucha paz.', tag: 'Positivo' },
        { id: 2, fecha: 'Ayer, 04:15 PM', texto: 'Las herramientas que me dio el psicólogo hoy fueron justo lo que necesitaba para mi ansiedad.', tag: 'Positivo' },
        { id: 3, fecha: '12 May, 09:00 AM', texto: 'Todo excelente, quizás podrían tener agua disponible en la sala de espera.', tag: 'Sugerencia' }
    ]
};

// --- COMPONENTES UI REUTILIZABLES ---

// 1. Tarjeta de KPI Superior
const KpiCard = ({ titulo, valor, subtitulo, icono, color_icono }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-2xl shrink-0 ${color_icono}`}>
            {icono}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{titulo}</p>
            <h3 className="text-2xl font-black text-[#113130] mt-0.5">{valor}</h3>
            <p className="text-[10px] font-medium text-slate-500 mt-1">{subtitulo}</p>
        </div>
    </div>
);

// 2. Gráfica de Barras Clásica
const CustomBarChart = ({ data, total }) => (
    <div className="space-y-3 mt-4">
        {data.map((item, idx) => {
            const porcentaje = Math.round((item.count / total) * 100) || 0;
            return (
                <div key={idx} className="relative group">
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-slate-600 group-hover:text-[#113130] transition-colors">{item.label}</span>
                        <span className="text-[#113130]">{porcentaje}% <span className="text-slate-400 font-medium ml-1">({item.count})</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${item.color} animate-fill-bar`} 
                            style={{ width: `${porcentaje}%` }}
                        ></div>
                    </div>
                </div>
            );
        })}
    </div>
);

// 3. Gráfico de Pastel (Donut) mejorado: 
// Se coloca el gráfico a la izquierda y la leyenda a la derecha en pantallas grandes, 
// o uno arriba del otro en pantallas pequeñas. Así evitamos superposiciones.
const DonutChart = ({ data, total }) => {
    let cumulativePercent = 0;
    const gradientStops = [];

    // Calcular los segmentos del círculo
    data.forEach((item) => {
        const percent = (item.count / total) * 100;
        if (percent > 0) {
            const start = cumulativePercent;
            const end = cumulativePercent + percent;
            gradientStops.push(`${item.hex} ${start}% ${end}%`);
            cumulativePercent += percent;
        }
    });

    const conicGradientString = gradientStops.join(', ');

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
            
            {/* El Gráfico Circular */}
            <div className="relative w-32 h-32 shrink-0">
                <div 
                    className="absolute inset-0 rounded-full shadow-sm"
                    style={{ background: `conic-gradient(${conicGradientString})` }}
                ></div>
                {/* Hueco del centro para hacerlo "Donut" */}
                <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-xl font-black text-[#113130]">{total}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                </div>
            </div>

            {/* La Leyenda (Lista de opciones) */}
            <div className="flex-1 w-full space-y-2.5">
                {data.map((item, idx) => {
                    const percent = Math.round((item.count / total) * 100) || 0;
                    if (percent === 0) return null; // Ocultar si tiene 0% para mantenerlo limpio

                    return (
                        <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded-sm shadow-sm shrink-0" 
                                    style={{ backgroundColor: item.hex }}
                                ></div>
                                <span className="text-xs font-bold text-slate-600 group-hover:text-[#113130] transition-colors leading-tight">
                                    {item.label}
                                </span>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                                <span className="text-xs font-black text-[#113130]">{percent}%</span>
                                <span className="text-[10px] font-medium text-slate-400 ml-1">({item.count})</span>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default function Experiencia() {
    const [filtroTiempo, setFiltroTiempo] = useState('mes');
    const total = estadisticas.total_evaluaciones;

    return (
        <div className="max-w-[1400px] mx-auto font-sans pb-16 bg-[#F4F8F8] min-h-screen px-4 pt-3 pb-16 sm:px-6 sm:pt-4 lg:px-8 lg:pt-5">
            
            {/* --- CABECERA --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5 gap-4 animate-fade-in-up">
                <div className="max-w-xl">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#113130] tracking-tight">Análisis de Experiencia</h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">Retroalimentación confidencial de pacientes.</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        Datos rápidos de la experiencia</div>
                </div>
                
                <div className="inline-flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-3xl shadow-sm border border-slate-200">
                    {['semana', 'mes', 'historico'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltroTiempo(f)}
                            className={`px-4 py-2 text-[11px] font-bold capitalize rounded-2xl transition-all ${
                                filtroTiempo === f 
                                ? 'bg-[#0F766E] text-white shadow-sm' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-[#113130]'
                            }`}
                        >
                            {f === 'historico' ? 'Histórico' : `Este ${f}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- SECCIÓN 1: RESUMEN RÁPIDO (KPIs) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10">
                <KpiCard 
                    titulo="Evaluaciones" 
                    valor={total} 
                    subtitulo="Cuestionarios completados"
                    icono={<IconUsers />}
                    color_icono="bg-blue-50 text-blue-600"
                />
                <KpiCard 
                    titulo="Satisfacción Global" 
                    valor={<div className="flex items-center gap-1.5">{estadisticas.promedio_satisfaccion} <IconStar className="w-6 h-6 text-amber-400" /></div>} 
                    subtitulo="Promedio histórico (Q1)"
                    icono={<IconStar className="w-6 h-6" />}
                    color_icono="bg-amber-50 text-amber-500"
                />
                <KpiCard 
                    titulo="Índice Promotores" 
                    valor={`${estadisticas.porcentaje_recomendacion}%`} 
                    subtitulo="Pacientes que recomiendan (Q9)"
                    icono={<IconTrending />}
                    color_icono="bg-emerald-50 text-emerald-600"
                />
            </div>

            {/* --- TÍTULO DE SECCIÓN DETALLADA --- */}
            <div className="mb-6 flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Desglose Pregunta por Pregunta</h2>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* --- SECCIÓN 2: DESGLOSE DE PREGUNTAS (Grid Espacioso de 2 Columnas) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                
                {/* Q1: Satisfacción */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q1. Satisfacción General</h3>
                    <p className="text-xs text-slate-400 mb-4">"Indique su nivel de satisfacción con el servicio..."</p>
                    <CustomBarChart data={estadisticas.Q1_satisfaccion} total={total} />
                </div>

                {/* Q2: Expectativas (Pastel) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q2. Cumplimiento de Expectativas</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿La atención cumplió con las expectativas previas?"</p>
                    <DonutChart data={estadisticas.Q2_expectativas} total={total} />
                </div>

                {/* Q3: Empatía (Pastel) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q3. Empatía y Conexión</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Te sentiste escuchado(a) y comprendido(a)?"</p>
                    <DonutChart data={estadisticas.Q3_empatia} total={total} />
                </div>

                {/* Q4: Aspectos Valorados */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q4. Aspectos más Valorados</h3>
                    <p className="text-xs text-slate-400 mb-4">"¿Qué aspecto(s) valora más de la atención médica?"</p>
                    <CustomBarChart data={estadisticas.Q4_aspectos} total={total} />
                </div>

                {/* Q5: Instalaciones */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q5. Instalaciones y Ambiente</h3>
                    <p className="text-xs text-slate-400 mb-4">"Satisfacción con comodidad, tranquilidad e higiene."</p>
                    <CustomBarChart data={estadisticas.Q5_instalaciones} total={total} />
                </div>

                {/* Q6: Claridad (Pastel) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q6. Claridad de Pautas</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Las explicaciones resultaron claras y útiles?"</p>
                    <DonutChart data={estadisticas.Q6_claridad} total={total} />
                </div>

                {/* Q7: Estado de Ánimo */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q7. Impacto en el Ánimo</h3>
                    <p className="text-xs text-slate-400 mb-4">"Estado de ánimo al finalizar la sesión."</p>
                    <CustomBarChart data={estadisticas.Q7_animo} total={total} />
                </div>

                {/* Q8: Confianza (Pastel) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q8. Confianza y Seguridad</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Sintió que el consultorio brindaba confianza?"</p>
                    <DonutChart data={estadisticas.Q8_confianza} total={total} />
                </div>

                {/* Q9: Recomendación (Pastel) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q9. Índice de Recomendación</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Qué tan probable es que recomiende a este especialista?"</p>
                    <DonutChart data={estadisticas.Q9_recomendacion} total={total} />
                </div>
            </div>

            {/* --- SECCIÓN 3: PREGUNTA ABIERTA (Q10) --- */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors animate-fade-in-up delay-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-black text-[#113130] mb-1">Q10. Sugerencias y Comentarios</h3>
                        <p className="text-xs text-slate-400">Feedback cualitativo escrito por los pacientes.</p>
                    </div>
                    <button className="text-xs font-bold text-[#0F766E] hover:text-[#0D9488] bg-teal-50 px-4 py-2 rounded-xl transition-colors">
                        Exportar Feedbacks
                    </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    {estadisticas.Q10_comentarios.map((comentario) => (
                        <div key={comentario.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                    comentario.tag === 'Positivo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {comentario.tag}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-500">{comentario.fecha}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed italic">"{comentario.texto}"</p>
                        </div>
                    ))}
                </div>
            </div>

           
        </div>
    );
}