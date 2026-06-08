import React, { useState } from 'react';
import { useParams } from 'react-router-dom';


export default function FormularioPaciente() {
    // 🌟 MAGIA PURA: React lee la URL (ej. /feedback/5) y guarda el "5" en esta variable
    const { psicologoId } = useParams();
    const [enviado, setEnviado] = useState(false);
    // 🌟 COMPONENTE PARA VOTAR CON ESTRELLAS INTERACTIVAS
    const StarRating = ({ value, onChange, label }) => (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-all hover:border-teal-100 group">
        <label className="block text-sm font-bold text-[#113130] mb-4 group-hover:text-[#0F766E]">{label}</label>
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                >
                    <svg 
                        className={`w-9 h-9 ${value >= star ? 'text-amber-400' : 'text-slate-300'} hover:text-amber-400 transition-colors`} 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                </button>
            ))}
            <span className="text-xs font-bold text-slate-400 ml-3 uppercase tracking-wider">
                {value === 5 ? 'Excelente' : value === 4 ? 'Bueno' : value === 3 ? 'Regular' : value === 2 ? 'Malo' : 'Pésimo'}
            </span>
        </div>
    </div>
);
// --- MANEJAR SELECCIÓN MÚLTIPLE DE Q4 ---
    const manejarCambioAspectos = (aspecto) => {
        let aspectosActuales = respuestas.q4_aspectos_valorados ? respuestas.q4_aspectos_valorados.split(', ') : [];
        
        if (aspectosActuales.includes(aspecto)) {
            // Si ya estaba, lo quitamos
            aspectosActuales = aspectosActuales.filter(a => a !== aspecto);
        } else {
            // Si no estaba, lo agregamos
            aspectosActuales.push(aspecto);
        }
        
        setRespuestas({ ...respuestas, q4_aspectos_valorados: aspectosActuales.join(', ') });
    };
    // Tu estado con las 10 preguntas vacías
    const [respuestas, setRespuestas] = useState({
        q1_satisfaccion_general: 5,
        q2_cumplimiento_expectativas: "",
        q3_empatia_conexion: "",
        q4_aspectos_valorados: "", // Se va vacía por ahora
        q5_instalaciones: 5,       // Valor por defecto
        q6_claridad_pautas: "",    // Se va vacía
        q7_impacto_animo: "",      // Se va vacía
        q8_confianza_seguridad: "",// Se va vacía
        q9_indice_recomendacion: "",
        q10_comentarios: ""
    });

 const enviarEncuesta = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/encuestas/publica/${psicologoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(respuestas)
            });

            if (response.ok) {
                setEnviado(true);
            } else {
                // 🌟 SI FALLA, AHORA SÍ NOS VA A DECIR POR QUÉ
                const errorData = await response.json();
                console.error("Detalle del error:", errorData);
                alert("Faltan preguntas por responder o hay un error de conexión.");
            }
        } catch (error) {
            console.error("Error al enviar:", error);
            alert("El servidor está apagado o hay un problema de red.");
        }
    };
    
    // Si ya la envió, le mostramos esto y ya no puede volver a hacer clic
    if (enviado) {
        return (
            <div className="min-h-screen bg-[#F4F8F8] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
                    <h2 className="text-2xl font-black text-[#113130] mb-2">¡Gracias por tu tiempo!</h2>
                    <p className="text-slate-500 text-sm">Tu feedback es 100% anónimo y nos ayuda a brindar un mejor servicio.</p>
                </div>
            </div>
        );
    }

    // El diseño del formulario para el paciente
   return (
        <div className="min-h-screen bg-[#F4F8F8] py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="bg-white max-w-3xl w-full rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-100 animate-fade-in">
                
                {/* CABECERA (Image 3 Estilizada) */}
                <div className="text-center mb-10 border-b border-slate-100 pb-8">
                    <h1 className="text-3xl font-black text-[#113130] tracking-tight">HorizonFlow</h1>
                    <p className="text-[#0F766E] text-xs font-bold uppercase tracking-[0.3em] mt-3">Encuesta de Experiencia</p>
                    <div className="mt-6 inline-flex items-center gap-3 bg-teal-50 px-5 py-2.5 rounded-full text-xs font-medium text-[#0F766E] border border-teal-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Tu opinión es 100% anónima y confidencial.
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Q1: Satisfacción (ESTRELLAS INTERACTIVAS) */}
                    <StarRating 
                        label="1. Satisfacción General con el servicio recibido"
                        value={respuestas.q1_satisfaccion_general}
                        onChange={(val) => setRespuestas({...respuestas, q1_satisfaccion_general: val})}
                    />

                    {/* GRUPO 1: DROPDOWNS CLÁSICOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Q2: Expectativas */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-[#113130] mb-3">2. ¿La atención cumplió tus expectativas?</label>
                            <select value={respuestas.q2_cumplimiento_expectativas} onChange={(e) => setRespuestas({...respuestas, q2_cumplimiento_expectativas: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-100 focus:border-[#0F766E]">
                                <option value="">Selecciona...</option>
                                <option value="Superó ampliamente">Superó ampliamente</option>
                                <option value="Cumplió totalmente">Cumplió totalmente</option>
                                <option value="Cumplió parcialmente">Cumplió parcialmente</option>
                                <option value="No cumplió">No cumplió</option>
                            </select>
                        </div>
                        {/* Q3: Empatía */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-[#113130] mb-3">3. ¿Te sentiste escuchado(a) y comprendido(a)?</label>
                            <select value={respuestas.q3_empatia_conexion} onChange={(e) => setRespuestas({...respuestas, q3_empatia_conexion: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-100 focus:border-[#0F766E]">
                                <option value="">Selecciona...</option>
                                <option value="Sí, en todo momento">Sí, en todo momento</option>
                                <option value="La mayor parte">La mayor parte del tiempo</option>
                                <option value="Solo a veces">Solo a veces</option>
                                <option value="No, me sentí incomprendido">No, me sentí incomprendido(a)</option>
                            </select>
                        </div>
                    </div>

                    {/* Q4: Aspectos Valorados (CHECKBOXES) */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <label className="block text-sm font-bold text-[#113130] mb-5">4. ¿Qué aspectos valorás más de la atención médica?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['Escucha activa y empatía', 'Claridad de explicaciones', 'Privacidad del espacio', 'Puntualidad'].map(aspecto => (
                                <label key={aspecto} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-teal-100 transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={respuestas.q4_aspectos_valorados ? respuestas.q4_aspectos_valorados.includes(aspecto) : false}
                                        onChange={() => manejarCambioAspectos(aspecto)}
                                        className="w-5 h-5 text-[#0F766E] rounded border-slate-300 focus:ring-[#0F766E]"
                                    />
                                    <span className="text-sm text-slate-700 font-medium">{aspecto}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Q5: Instalaciones (ESTRELLAS INTERACTIVAS) */}
                    <StarRating 
                        label="5. Satisfacción con las instalaciones (limpieza, comodidad)"
                        value={respuestas.q5_instalaciones}
                        onChange={(val) => setRespuestas({...respuestas, q5_instalaciones: val})}
                    />

                    {/* GRUPO 2: DROPDOWNS CLÁSICOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Q6: Claridad */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-[#113130] mb-3">6. ¿Las pautas médicas fueron claras y útiles?</label>
                            <select value={respuestas.q6_claridad_pautas} onChange={(e) => setRespuestas({...respuestas, q6_claridad_pautas: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-100">
                                <option value="">Selecciona...</option>
                                <option value="Totalmente claras">Totalmente claras</option>
                                <option value="Claras en su mayoría">Claras en su mayoría</option>
                                <option value="Me quedaron dudas">Me quedaron dudas</option>
                                <option value="Fueron confusas">Fueron confusas</option>
                            </select>
                        </div>
                        {/* Q7: Ánimo */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-[#113130] mb-3">7. ¿Cómo calificarías tu estado de ánimo actual?</label>
                            <select value={respuestas.q7_impacto_animo} onChange={(e) => setRespuestas({...respuestas, q7_impacto_animo: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-100">
                                <option value="">Selecciona...</option>
                                <option value="Mucho mejor">Mucho mejor</option>
                                <option value="Algo mejor">Algo mejor</option>
                                <option value="Igual">Igual</option>
                                <option value="Peor">Peor</option>
                            </select>
                        </div>
                    </div>

                    {/* GRUPO 3: RECOMENDACIÓN Y CONFIANZA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Q8: Confianza */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-[#113130] mb-3">8. ¿Sentiste confianza y seguridad en el espacio?</label>
                            <select value={respuestas.q8_confianza_seguridad} onChange={(e) => setRespuestas({...respuestas, q8_confianza_seguridad: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-100">
                                <option value="">Selecciona...</option>
                                <option value="Completamente seguro">Completamente seguro</option>
                                <option value="En su mayor parte">En su mayor parte</option>
                                <option value="Me costó abrirme">Me costó abrirme</option>
                                <option value="No me sentí seguro">No me sentí seguro</option>
                            </select>
                        </div>
                        {/* Q9: Recomendación */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-[#113130] mb-3">9. ¿Qué tan probable es que nos recomendés?</label>
                            <select value={respuestas.q9_indice_recomendacion} onChange={(e) => setRespuestas({...respuestas, q9_indice_recomendacion: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-100">
                                <option value="">Selecciona...</option>
                                <option value="Definitivamente">Definitivamente sí</option>
                                <option value="Probablemente">Probablemente sí</option>
                                <option value="Poco probable">Poco probable</option>
                                <option value="Definitivamente no">Definitivamente no</option>
                            </select>
                        </div>
                    </div>

                    {/* Q10: Comentarios (TEXTAREA ESTILIZADO) */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <label className="block text-sm font-bold text-[#113130] mb-3">10. Comentarios adicionales o sugerencias (Opcional)</label>
                        <textarea 
                            rows="4"
                            placeholder="Ej. Me sentí muy cómodo(a), las herramientas que me dio el psicólogo fueron muy útiles..."
                            value={respuestas.q10_comentarios}
                            onChange={(e) => setRespuestas({...respuestas, q10_comentarios: e.target.value})}
                            className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 resize-none"
                        ></textarea>
                    </div>
                </div>

                {/* BOTÓN DE ENVIAR (Estilo Image 3 Mejorado) */}
                <button 
                    onClick={enviarEncuesta}
                    className="w-full bg-[#113130] hover:bg-[#0F766E] text-white font-black uppercase tracking-[0.15em] text-sm py-4.5 rounded-2xl transition-all shadow-md hover:shadow-lg mt-10 active:scale-[0.98]"
                >
                    Enviar Respuestas Anónimas
                </button>

            </div>
        </div>
    );
}