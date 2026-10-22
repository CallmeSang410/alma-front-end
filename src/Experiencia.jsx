import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { createPortal } from 'react-dom';
import './Experiencia.css'; 
import { useAlerta, AlertaProvider } from './AlertaContext.jsx'; // 🌟 1. Importamos el sistema de alertas premium
import api from './api'; // Importás tu instancia configurada
import FocusTrap from './components/FocusTrap';

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

// --- COMPONENTES UI REUTILIZABLES ---
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

const DonutChart = ({ data, total }) => {
    let cumulativePercent = 0;
    const gradientStops = [];

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
            <div className="relative w-32 h-32 shrink-0">
                <div 
                    className="absolute inset-0 rounded-full shadow-sm"
                    style={{ background: `conic-gradient(${conicGradientString})` }}
                ></div>
                <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-xl font-black text-[#113130]">{total}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                </div>
            </div>

            <div className="flex-1 w-full space-y-2.5">
                {data.map((item, idx) => {
                    const percent = Math.round((item.count / total) * 100) || 0;
                    if (percent === 0) return null; 

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


// --- ESTADO INICIAL VACÍO ---
const estadisticasVacias = {
    total_evaluaciones: 0, promedio_satisfaccion: 0, porcentaje_recomendacion: 0,
    Q1_satisfaccion: [
        { label: '5 Estrellas (Excelente)', count: 0, color: 'bg-emerald-500' },
        { label: '4 Estrellas (Bueno)', count: 0, color: 'bg-teal-400' },
        { label: '3 Estrellas (Regular)', count: 0, color: 'bg-amber-400' },
        { label: '2 Estrellas (Malo)', count: 0, color: 'bg-orange-400' },
        { label: '1 Estrella (Pésimo)', count: 0, color: 'bg-rose-500' }
    ],
    Q2_expectativas: [
        { label: 'Superó ampliamente', count: 0, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'Cumplió totalmente', count: 0, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Cumplió parcialmente', count: 0, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'No cumplió', count: 0, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q3_empatia: [
        { label: 'Sí, en todo momento', count: 0, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'La mayor parte', count: 0, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Solo a veces', count: 0, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'No, me sentí incomprendido', count: 0, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q4_aspectos: [
        { label: 'Escucha activa y empatía', count: 0, color: 'bg-[#0F766E]' },
        { label: 'Claridad de explicaciones', count: 0, color: 'bg-[#0F766E]' },
        { label: 'Privacidad del espacio', count: 0, color: 'bg-[#0F766E]' },
        { label: 'Puntualidad', count: 0, color: 'bg-[#0F766E]' }
    ],
    Q5_instalaciones: [
        { label: '5 Estrellas', count: 0, color: 'bg-emerald-500' },
        { label: '4 Estrellas', count: 0, color: 'bg-teal-400' },
        { label: '3 Estrellas', count: 0, color: 'bg-amber-400' },
        { label: '1 - 2 Estrellas', count: 0, color: 'bg-rose-500' }
    ],
    Q6_claridad: [
        { label: 'Totalmente claras', count: 0, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'Claras en su mayoría', count: 0, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Me quedaron dudas', count: 0, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'Fueron confusas', count: 0, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q7_animo: [
        { label: 'Mucho mejor', count: 0, color: 'bg-emerald-500' },
        { label: 'Algo mejor', count: 0, color: 'bg-teal-400' },
        { label: 'Igual', count: 0, color: 'bg-slate-300' },
        { label: 'Peor', count: 0, color: 'bg-rose-400' }
    ],
    Q8_confianza: [
        { label: 'Completamente seguro', count: 0, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'En su mayor parte', count: 0, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Me costó abrirme', count: 0, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'No me sentí seguro', count: 0, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q9_recomendacion: [
        { label: 'Definitivamente', count: 0, color: 'bg-emerald-600', hex: '#059669' },
        { label: 'Probablemente', count: 0, color: 'bg-teal-400', hex: '#2DD4BF' },
        { label: 'Poco probable', count: 0, color: 'bg-amber-400', hex: '#FBBF24' },
        { label: 'Definitivamente no', count: 0, color: 'bg-rose-500', hex: '#F43F5E' }
    ],
    Q10_comentarios: []
};

// 🌟 2. Cambiamos la firma de la función para prepararla para el "Hack Anti-Choques"
const Experiencia = () => {
    // 🌟 3. INICIALIZAMOS EL ESCUDO DE ALERTAS PREMIUM
    const contextoAlerta = useAlerta();
    const mostrarAlerta = contextoAlerta ? contextoAlerta.mostrarAlerta : (t, tit, msj) => alert(`${tit}: ${msj}`);

    const [filtroTiempo, setFiltroTiempo] = useState('mes');
    const [estadisticas, setEstadisticas] = useState(estadisticasVacias);
    const [mostrarQR, setMostrarQR] = useState(false);

    let linkEncuesta = "";
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            linkEncuesta = `${window.location.origin}/feedback/${payload.usuario_id}`;
        } catch (e) {
            console.error("Error leyendo token");
        }
    }
    
    const procesarDatosEncuestas = (datosCrudos) => {
        if (!Array.isArray(datosCrudos)) {
            console.error("FastAPI no devolvió una lista:", datosCrudos);
            return;
        }

        const total = datosCrudos.length;
        if (total === 0) return; 

        const sumQ1 = datosCrudos.reduce((acc, curr) => acc + (curr.q1_satisfaccion_general || 0), 0);
        const promedio = (sumQ1 / total).toFixed(1);
        
        const countRecomendacion = datosCrudos.filter(d => d.q9_indice_recomendacion === 'Definitivamente').length;
        const porcentajeRec = Math.round((countRecomendacion / total) * 100);

        const contar = (campo, valor) => datosCrudos.filter(d => d[campo] === valor).length;
        const contarAspecto = (texto) => datosCrudos.filter(d => d.q4_aspectos_valorados && d.q4_aspectos_valorados.includes(texto)).length;

        setEstadisticas({
            total_evaluaciones: total,
            promedio_satisfaccion: promedio,
            porcentaje_recomendacion: porcentajeRec,
            
            Q1_satisfaccion: [
                { label: '5 Estrellas (Excelente)', count: contar('q1_satisfaccion_general', 5), color: 'bg-emerald-500' },
                { label: '4 Estrellas (Bueno)', count: contar('q1_satisfaccion_general', 4), color: 'bg-teal-400' },
                { label: '3 Estrellas (Regular)', count: contar('q1_satisfaccion_general', 3), color: 'bg-amber-400' },
                { label: '2 Estrellas (Malo)', count: contar('q1_satisfaccion_general', 2), color: 'bg-orange-400' },
                { label: '1 Estrella (Pésimo)', count: contar('q1_satisfaccion_general', 1), color: 'bg-rose-500' }
            ],
           Q2_expectativas: [
                { label: 'Superó ampliamente', count: contar('q2_cumplimiento_expectativas', 'Superó ampliamente mis expectativas'), color: 'bg-emerald-600', hex: '#059669' },
                { label: 'Cumplió totalmente', count: contar('q2_cumplimiento_expectativas', 'Cumplió totalmente mis expectativas'), color: 'bg-teal-400', hex: '#2DD4BF' },
                { label: 'Cumplió parcialmente', count: contar('q2_cumplimiento_expectativas', 'Cumplió parcialmente'), color: 'bg-amber-400', hex: '#FBBF24' },
                { label: 'No cumplió', count: contar('q2_cumplimiento_expectativas', 'No cumplió mis expectativas'), color: 'bg-rose-500', hex: '#F43F5E' }
            ],
           Q3_empatia: [
                { label: 'Sí, en todo momento', count: contar('q3_empatia_conexion', 'Sí, en todo momento'), color: 'bg-emerald-600', hex: '#059669' },
                { label: 'La mayor parte', count: contar('q3_empatia_conexion', 'La mayor parte del tiempo'), color: 'bg-teal-400', hex: '#2DD4BF' },
                { label: 'Solo a veces', count: contar('q3_empatia_conexion', 'Solo en algunos momentos'), color: 'bg-amber-400', hex: '#FBBF24' },
                { label: 'No, me sentí incomprendido', count: contar('q3_empatia_conexion', 'No, me sentí poco comprendido(a)'), color: 'bg-rose-500', hex: '#F43F5E' }
            ],
            Q4_aspectos: [
                { label: 'Escucha activa y empatía', count: contarAspecto('Escucha activa y empatía'), color: 'bg-[#0F766E]' },
                { label: 'Claridad de explicaciones', count: contarAspecto('Claridad de explicaciones'), color: 'bg-[#0F766E]' },
                { label: 'Privacidad del espacio', count: contarAspecto('Privacidad del espacio'), color: 'bg-[#0F766E]' },
                { label: 'Puntualidad', count: contarAspecto('Puntualidad'), color: 'bg-[#0F766E]' }
            ],
            Q5_instalaciones: [
                { label: '5 Estrellas', count: contar('q5_instalaciones', 5), color: 'bg-emerald-500' },
                { label: '4 Estrellas', count: contar('q5_instalaciones', 4), color: 'bg-teal-400' },
                { label: '3 Estrellas', count: contar('q5_instalaciones', 3), color: 'bg-amber-400' },
                { label: '1 - 2 Estrellas', count: contar('q5_instalaciones', 2) + contar('q5_instalaciones', 1), color: 'bg-rose-500' }
            ],
           Q6_claridad: [
                { label: 'Totalmente claras', count: contar('q6_claridad_pautas', 'Totalmente claras y fáciles de aplicar'), color: 'bg-emerald-600', hex: '#059669' },
                { label: 'Claras en su mayoría', count: contar('q6_claridad_pautas', 'Claras en su mayoría'), color: 'bg-teal-400', hex: '#2DD4BF' },
                { label: 'Me quedaron dudas', count: contar('q6_claridad_pautas', 'Me quedaron algunas dudas sobre cómo aplicarlas'), color: 'bg-amber-400', hex: '#FBBF24' },
                { label: 'Fueron confusas', count: contar('q6_claridad_pautas', 'Fueron confusas o poco claras'), color: 'bg-rose-500', hex: '#F43F5E' }
            ],
            Q7_animo: [
                { label: 'Mucho mejor', count: contar('q7_impacto_animo', 'Mucho mejor'), color: 'bg-emerald-500' },
                { label: 'Algo mejor', count: contar('q7_impacto_animo', 'Algo mejor'), color: 'bg-teal-400' },
                { label: 'Igual', count: contar('q7_impacto_animo', 'Igual'), color: 'bg-slate-300' },
                { label: 'Peor', count: contar('q7_impacto_animo', 'Peor'), color: 'bg-rose-400' }
            ],
            
            Q8_confianza: [
                { label: 'Completamente seguro', count: contar('q8_confianza_seguridad', 'Sí, me sentí completamente seguro(a) y en confianza'), color: 'bg-emerald-600', hex: '#059669' },
                { label: 'En su mayor parte', count: contar('q8_confianza_seguridad', 'En su mayor parte me sentí cómodo(a)'), color: 'bg-teal-400', hex: '#2DD4BF' },
                { label: 'Me costó abrirme', count: contar('q8_confianza_seguridad', 'Me costó un poco abrirme en este espacio'), color: 'bg-amber-400', hex: '#FBBF24' },
                { label: 'No me sentí seguro', count: contar('q8_confianza_seguridad', 'No me sentí seguro(a) ni en confianza'), color: 'bg-rose-500', hex: '#F43F5E' }
            ],
            Q9_recomendacion: [
                { label: 'Definitivamente', count: contar('q9_indice_recomendacion', 'Definitivamente lo recomendaría'), color: 'bg-emerald-600', hex: '#059669' },
                { label: 'Probablemente', count: contar('q9_indice_recomendacion', 'Probablemente lo recomendaría'), color: 'bg-teal-400', hex: '#2DD4BF' },
                { label: 'Poco probable', count: contar('q9_indice_recomendacion', 'Poco probable'), color: 'bg-amber-400', hex: '#FBBF24' },
                { label: 'Definitivamente no', count: contar('q9_indice_recomendacion', 'Definitivamente no lo recomendaría'), color: 'bg-rose-500', hex: '#F43F5E' }
            ],
            Q10_comentarios: datosCrudos
                .filter(d => d.q10_comentarios && d.q10_comentarios.trim() !== '')
                .map(d => ({
                    id: d.id,
                    fecha: new Date(d.fecha_generacion).toLocaleDateString(), 
                    texto: d.q10_comentarios,
                    tag: d.tipo_comentario || 'Neutro'
                }))
        });
    };
    
    useEffect(() => {
        const cargarExperiencias = async () => {
            try {
                // Ya no validamos el token manual ni pasamos headers, api.js lo hace
                const response = await api.get('/encuestas');
                
                // Axios entrega los datos listos en .data
                procesarDatosEncuestas(response.data);
                
            } catch (error) {
                console.error("Error cargando encuestas:", error);
            }
        };

        cargarExperiencias();
    }, [filtroTiempo]);

    // --- FUNCIÓN PARA GENERAR Y COPIAR EL LINK PÚBLICO ---
    const copiarLinkPaciente = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // 🌟 REEMPLAZAMOS EL ALERT FEO AQUÍ
                mostrarAlerta('error', 'Sesión no encontrada', 'No se encontró la sesión del usuario.');
                return;
            }
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const usuarioId = payload.usuario_id;
            
            const link = `${window.location.origin}/feedback/${usuarioId}`;
            
            navigator.clipboard.writeText(link);
            
            // 🌟 REEMPLAZAMOS EL ALERT FEO AQUÍ POR LA ALERTA PREMIUM DE ÉXITO
            mostrarAlerta('exito', '¡Link copiado con éxito!', 'Ya podés enviárselo al paciente por WhatsApp. 🚀');
            
            // (Opcional) Puedes descomentar la siguiente línea si quieres que el modal se cierre automáticamente al copiar el link:
            // setMostrarQR(false); 
            
        } catch (error) {
            console.error("Error al generar el link:", error);
            // 🌟 REEMPLAZAMOS EL ALERT FEO AQUÍ
            mostrarAlerta('error', 'Error al copiar', 'Hubo un problema al copiar el link.');
        }
    };
    
    const total = estadisticas.total_evaluaciones;

    return (
        <div className="w-full max-w-[1400px] mx-auto font-sans pb-16 bg-[#f8fafc] min-h-screen px-4 pt-3 pb-16 sm:px-6 sm:pt-4 lg:px-8 lg:pt-5">
            
            {/* --- CABECERA --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5 gap-4 animate-fade-in-up">
                <div className="max-w-xl">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#113130] tracking-tight">Análisis de Experiencia</h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">Retroalimentación confidencial de pacientes.</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        Datos rápidos de la experiencia
                    </div>
                </div>
                
                {/* CONTENEDOR DERECHO: Botón + Filtros */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    
                    <button 
                        onClick={() => setMostrarQR(true)}
                        className="px-4 py-2 bg-[#0F766E] text-white text-[11px] font-bold uppercase tracking-wider rounded-2xl shadow-sm hover:bg-[#0D9488] transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                        Compartir Encuesta
                    </button>

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
            </div>

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

            <div className="mb-6 flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Desglose Pregunta por Pregunta</h2>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q1. Satisfacción General</h3>
                    <p className="text-xs text-slate-400 mb-4">"Indique su nivel de satisfacción con el servicio..."</p>
                    <CustomBarChart data={estadisticas.Q1_satisfaccion} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q2. Cumplimiento de Expectativas</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿La atención cumplió con las expectativas previas?"</p>
                    <DonutChart data={estadisticas.Q2_expectativas} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q3. Empatía y Conexión</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Te sentiste escuchado(a) y comprendido(a)?"</p>
                    <DonutChart data={estadisticas.Q3_empatia} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q4. Aspectos más Valorados</h3>
                    <p className="text-xs text-slate-400 mb-4">"¿Qué aspecto(s) valora más de la atención médica?"</p>
                    <CustomBarChart data={estadisticas.Q4_aspectos} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q5. Instalaciones y Ambiente</h3>
                    <p className="text-xs text-slate-400 mb-4">"Satisfacción con comodidad, tranquilidad e higiene."</p>
                    <CustomBarChart data={estadisticas.Q5_instalaciones} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q6. Claridad de Pautas</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Las explicaciones resultaron claras y útiles?"</p>
                    <DonutChart data={estadisticas.Q6_claridad} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q7. Impacto en el Ánimo</h3>
                    <p className="text-xs text-slate-400 mb-4">"Estado de ánimo al finalizar la sesión."</p>
                    <CustomBarChart data={estadisticas.Q7_animo} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q8. Confianza y Seguridad</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Sintió que el consultorio brindaba confianza?"</p>
                    <DonutChart data={estadisticas.Q8_confianza} total={total} />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
                    <h3 className="text-sm font-black text-[#113130] mb-1">Q9. Índice de Recomendación</h3>
                    <p className="text-xs text-slate-400 mb-2">"¿Qué tan probable es que recomiende a este especialista?"</p>
                    <DonutChart data={estadisticas.Q9_recomendacion} total={total} />
                </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors animate-fade-in-up delay-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-black text-[#113130] mb-1">Q10. Sugerencias y Comentarios</h3>
                        <p className="text-xs text-slate-400">Feedback cualitativo escrito por los pacientes.</p>
                    </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    {estadisticas.Q10_comentarios.length === 0 ? (
                         <p className="text-sm text-slate-400 text-center py-10">Aún no hay comentarios registrados.</p>
                    ) : (
                        estadisticas.Q10_comentarios.map((comentario) => (
                            <div key={comentario.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                        comentario.tag === 'POSITIVO' ? 'bg-emerald-100 text-emerald-700' : 
                                        comentario.tag === 'NEGATIVO' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {comentario.tag}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-500">{comentario.fecha}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed italic">"{comentario.texto}"</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
{mostrarQR && createPortal(
    <div className="fixed inset-0 bg-[#113130]/80 flex items-center justify-center z-[99999] p-4 transition-opacity" onClick={() => setMostrarQR(false)}>
        <FocusTrap active={mostrarQR} onClose={() => setMostrarQR(false)}>
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center max-w-sm w-full relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            
            <button 
                onClick={() => setMostrarQR(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-colors p-2 rounded-full"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="mb-6 mt-2">
                <h3 className="text-xl font-black text-[#113130] mb-2 tracking-tight">Evaluación de Calidad</h3>
                <p className="text-sm text-slate-500 font-medium px-4">Pídale al paciente que escanee este código con la cámara de su celular.</p>
            </div>
            
            <div className="flex justify-center mb-8">
                <div className="p-5 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
                    <QRCodeCanvas 
                        value={linkEncuesta} 
                        size={180} 
                        level={"H"} 
                        fgColor={"#0F766E"}
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-3 mb-5 opacity-70">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opción Alternativa</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            
            <button 
                onClick={copiarLinkPaciente} 
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                Copiar Link Directo
            </button>
        </div>
        </FocusTrap>
    </div>,
    document.body
)}
        </div>
    );
};

// 🌟 4. NUESTRO HACK ANTI-CHOQUES PARA INYECTAR LAS ALERTAS
export default function ExperienciaIntegrada(props) {
    return (
        <AlertaProvider>
            <Experiencia {...props} />
        </AlertaProvider>
    );
}