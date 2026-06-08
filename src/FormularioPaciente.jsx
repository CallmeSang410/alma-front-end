import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function FormularioPaciente() {
    // 🌟 MAGIA PURA: React lee la URL (ej. /feedback/5) y guarda el "5" en esta variable
    const { psicologoId } = useParams();
    const [enviado, setEnviado] = useState(false);

    // Tu estado con las 10 preguntas vacías
    const [respuestas, setRespuestas] = useState({
        q1_satisfaccion_general: 5,
        q2_cumplimiento_expectativas: "",
        q3_empatia_conexion: "",
        // ... (las demás preguntas)
        q10_comentarios: ""
    });

    const enviarEncuesta = async () => {
        try {
            // 🌟 Le pegamos a la ruta PÚBLICA de tu FastAPI y le pegamos el ID del psicólogo al final
            const response = await fetch(`http://127.0.0.1:8000/encuestas/publica/${psicologoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(respuestas)
            });

            if (response.ok) {
                setEnviado(true); // Ocultamos el formulario y mostramos un "Gracias"
            }
        } catch (error) {
            console.error("Error al enviar:", error);
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
        <div className="min-h-screen bg-[#F4F8F8] p-4 flex justify-center">
            <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-10 shadow-sm">
                
                {/* Un logo o título bonito arriba */}
                <div className="text-center mb-8">
                    <h1 className="text-xl font-black text-[#113130]">HorizonFlow</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Encuesta de Experiencia</p>
                </div>

                {/* AQUÍ VAN TUS INPUTS, SELECTS Y BOTONES */}
                {/* Ejemplo de cómo actualizar el estado: */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-[#113130] mb-2">1. ¿Qué tan satisfecho estás con la consulta?</label>
                    <input 
                        type="number" 
                        max="5" min="1"
                        value={respuestas.q1_satisfaccion_general}
                        onChange={(e) => setRespuestas({...respuestas, q1_satisfaccion_general: parseInt(e.target.value)})}
                        className="border p-2 rounded-lg w-full"
                    />
                </div>

                {/* Botón de Enviar */}
                <button 
                    onClick={enviarEncuesta}
                    className="w-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold py-4 rounded-2xl transition-colors mt-6"
                >
                    Enviar Feedback de Forma Anónima
                </button>

            </div>
        </div>
    );
}