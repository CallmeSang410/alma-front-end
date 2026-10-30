import { createPortal } from 'react-dom';
import FocusTrap from './FocusTrap';

const SHORTCUT_SECTIONS = [
    {
        title: 'Navegación Direccional y Selección',
        items: [
            { keys: ['↑', '↓', '←', '→'], label: 'Moverse libremente entre tarjetas, botones, tablas y campos' },
            { keys: ['Enter'], label: 'Seleccionar opción, abrir expediente de paciente o confirmar acción' },
            { keys: ['Tab', 'Shift + Tab'], label: 'Avanzar o retroceder secuencialmente entre controles' },
            { keys: ['Escape'], label: 'Cerrar ventana flotante, cancelar formulario o volver al listado' },
        ]
    },
    {
        title: 'Módulos del Sistema',
        items: [
            { keys: ['Alt', '1'], label: 'Ir al Dashboard Clínico' },
            { keys: ['Alt', '2'], label: 'Ir al Directorio de Pacientes' },
            { keys: ['Alt', '3'], label: 'Ir a la Agenda de Citas' },
            { keys: ['Alt', '4'], label: 'Ir a Evaluaciones y Reportes' },
            { keys: ['Alt', '5'], label: 'Ir al Panel de Experiencia' },
            { keys: ['Alt', '6'], label: 'Ir a Ajustes del Consultorio' },
        ]
    },
    {
        title: 'Acciones Clínicas Rápidas',
        items: [
            { keys: ['Ctrl', 'J'], label: 'Abrir / Cerrar Asistente Virtual ALMA' },
            { keys: ['/'], label: 'Enfocar barra de búsqueda en la vista actual' },
            { keys: ['Alt', 'N'], label: 'Registrar Nuevo Paciente (en Pacientes)' },
            { keys: ['Alt', 'C'], label: 'Agendar Nueva Cita (en Citas)' },
            { keys: ['Ctrl', 'Enter'], label: 'Guardar formulario actual (Paciente, Cita o Reporte)' },
            { keys: ['Ctrl', '→ / ←'], label: 'Avanzar o retroceder de paso en Wizard de Reportes' },
            { keys: ['?'], label: 'Mostrar / Ocultar esta guía de navegación' },
        ]
    }
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 print:hidden">
            <div
                className="absolute inset-0 bg-[#113130]/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <FocusTrap active={isOpen} onClose={onClose} className="relative z-10 w-full max-w-2xl">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="kb-modal-title"
                    className="bg-white rounded-[2rem] shadow-2xl border border-teal-100 overflow-hidden animate-fade-in max-h-[85vh] flex flex-col"
                >
                    <div className="bg-[#113130] px-6 py-5 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <div>
                                <h3 id="kb-modal-title" className="text-base font-black tracking-tight">
                                    Navegación por Teclado y Atajos
                                </h3>
                                <p className="text-[11px] text-teal-200/80 font-medium">
                                    Controla HorizonFlow con las flechas direccionales, Enter, Escape y atajos rápidos
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            data-autofocus="true"
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Cerrar guía de teclado"
                        >
                            ✕
                        </button>
                    </div>

                    <div data-modal-scroll="true" className="p-6 overflow-y-auto space-y-6">
                        {SHORTCUT_SECTIONS.map((sec, sIdx) => (
                            <div key={sIdx}>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F766E] mb-3 border-b border-slate-100 pb-1.5">
                                    {sec.title}
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {sec.items.map((item, iIdx) => (
                                        <div
                                            key={iIdx}
                                            className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/80 border border-slate-100"
                                        >
                                            <span className="text-xs font-bold text-[#113130] pr-3">
                                                {item.label}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {item.keys.map((k, kIdx) => (
                                                    <kbd
                                                        key={kIdx}
                                                        className="px-2 py-1 text-[10px] font-black bg-white text-[#0F766E] border border-slate-200 rounded-lg shadow-2xs font-mono"
                                                    >
                                                        {k}
                                                    </kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                        <span className="text-[11px] font-bold text-slate-400">
                            Presiona <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[#113130] font-mono">Esc</kbd> en cualquier momento para volver o cerrar
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </FocusTrap>
        </div>,
        document.body
    );
}

