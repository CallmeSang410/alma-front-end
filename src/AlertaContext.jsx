import React, { createContext, useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FocusTrap from './components/FocusTrap';

const AlertaContext = createContext();

export const AlertaProvider = ({ children }) => {
    const [alerta, setAlerta] = useState({
        visible: false,
        tipo: 'exito', 
        titulo: '',
        mensaje: ''
    });

    const mostrarAlerta = (tipo, titulo, mensaje) => {
        setAlerta({ visible: true, tipo, titulo, mensaje });

        if (tipo === 'exito') {
            setTimeout(() => {
                setAlerta(prev => ({ ...prev, visible: false }));
            }, 3000);
        }
    };

    const cerrarAlerta = () => {
        // Le damos 200ms extra antes de ocultarla para que pueda hacer una animación de salida si quisieras en el futuro
        setAlerta(prev => ({ ...prev, visible: false }));
    };

    useEffect(() => {
        if (alerta.visible) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [alerta.visible]);

    useEffect(() => {
        if (!alerta.visible) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                cerrarAlerta();
            }
        };
        window.addEventListener('keydown', handleKey, true);
        return () => window.removeEventListener('keydown', handleKey, true);
    }, [alerta.visible]);

    return (
        <AlertaContext.Provider value={{ mostrarAlerta }}>
            {children}

            {alerta.visible && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 w-screen h-screen perspective-1000">
                    
                    {/* Fondo Oscuro con Desenfoque Suave */}
                    <div 
                        className="absolute inset-0 bg-[#061514]/60 backdrop-blur-md animate-backdrop" 
                        onClick={cerrarAlerta} 
                    />
                    
                    {/* Tarjeta de la Alerta con Animación de Rebote */}
                    <FocusTrap active={alerta.visible} onClose={cerrarAlerta} className="w-full max-w-sm relative z-10 mx-auto">
                    <div className="bg-white rounded-[2.5rem] w-full p-8 shadow-[0_20px_60px_-15px_rgba(17,49,48,0.3)] border border-slate-50 text-center animate-modal">
                        
                        {/* --- ÍCONO DINÁMICO (Con Degradados) --- */}
                        {alerta.tipo === 'exito' ? (
                            <div className="mx-auto w-24 h-24 mb-6 relative flex items-center justify-center">
                                {/* Anillo decorativo exterior */}
                                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse-slow"></div>
                                {/* Círculo principal */}
                                <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-100 text-[#10B981] rounded-full flex items-center justify-center shadow-inner border border-emerald-200/50">
                                    <svg className="w-10 h-10 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="mx-auto w-24 h-24 mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-rose-100 rounded-full animate-pulse-slow"></div>
                                <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-rose-50 to-red-100 text-[#F43F5E] rounded-full flex items-center justify-center shadow-inner border border-rose-200/50">
                                    <svg className="w-10 h-10 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* --- TEXTOS MÁS BOLD Y ESTILIZADOS --- */}
                        <h3 className="text-[26px] font-black text-[#113130] mb-2 tracking-tighter leading-tight">
                            {alerta.titulo}
                        </h3>
                        <p className="text-[13px] text-slate-500 font-bold mb-8 leading-relaxed px-2">
                            {alerta.mensaje}
                        </p>
                        
                        {/* --- BOTÓN DINÁMICO (Con Degradados y Hover Elegante) --- */}
                        <button 
                            data-autofocus="true"
                            onClick={cerrarAlerta} 
                            className={`w-full py-4 px-4 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:-translate-y-1 ${
                                alerta.tipo === 'exito' 
                                ? 'bg-gradient-to-r from-[#10B981] to-[#0D9488] shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.5)]' 
                                : 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_10px_25px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(244,63,94,0.5)]'
                            }`}
                        >
                            {alerta.tipo === 'exito' ? 'Entendido' : 'Atrás'}
                        </button>
                    </div>
                    </FocusTrap>
                </div>,
                document.body
            )}
            
            {/* 🌟 CSS DE TRANSICIONES MEJORADAS INYECTADO */}
            <style>{`
                /* Fondo que entra suave y aplica el blur poco a poco */
                .animate-backdrop { 
                    animation: fadeBackdrop 0.4s ease-out forwards; 
                }
                
                /* Modal que hace un ligero rebote como app nativa de iOS */
                .animate-modal { 
                    animation: popInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
                }
                
                /* Latido suave detrás del ícono */
                .animate-pulse-slow {
                    animation: pulseGlow 3s infinite ease-in-out;
                }

                @keyframes fadeBackdrop { 
                    from { opacity: 0; backdrop-filter: blur(0px); } 
                    to { opacity: 1; backdrop-filter: blur(12px); } 
                }
                
                @keyframes popInBounce { 
                    0% { opacity: 0; transform: scale(0.85) translateY(20px); } 
                    50% { opacity: 1; transform: scale(1.02) translateY(-5px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); } 
                }

                @keyframes pulseGlow {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.15); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </AlertaContext.Provider>
    );
};

export const useAlerta = () => useContext(AlertaContext);