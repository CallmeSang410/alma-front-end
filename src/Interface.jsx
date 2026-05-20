import React, { useState } from 'react';
import './Interface.css';
import logoEmpresa from './assets/logo.png';

// --- ICONOS VECTORIALES CLÍNICOS ---
function IconDashboard() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
    );
}

const IconPatients = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconCalendar = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconReports = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

const IconExperience = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const IconSettings = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37 1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35 1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconLogout = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
        { id: 'pacientes', label: 'Pacientes', icon: <IconPatients /> },
        { id: 'citas', label: 'Citas', icon: <IconCalendar /> },
        { id: 'reportes', label: 'Reportes', icon: <IconReports /> },
        { id: 'experiencia', label: 'Experiencia', icon: <IconExperience /> },
        { id: 'settings', label: 'Ajustes', icon: <IconSettings /> },
    ];

    return (
        <div className="min-h-screen font-sans bg-[#F4F8F8] text-[#113130] flex flex-col lg:flex-row antialiased relative">
        
      {/* ================= CABECERA MÓVIL ================= */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#0F766E] text-white shadow-md relative py-6">
            {/* Contenedor invisible para empujar el logo al centro exacto */}
            <div className="w-10 h-10 invisible" />
            
            {/* Logo en versión Móvil: Se usa w-48 (ancho grande) y scale-110 para que destaque mucho más */}
            <div className="flex items-center justify-center flex-1">
                <img src={logoEmpresa} alt="HorizonFlow logo" className="w-48 h-auto object-contain transform scale-110" />
            </div>
            
            {/* Botón Hamburguesa Responsivo */}
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none z-10"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>

        {/* ================= 1. BARRA LATERAL (PC Y MÓVIL DESLIZABLE) ================= */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F766E] text-white flex flex-col justify-between transform lg:transform-none lg:opacity-100 lg:relative transition-all duration-300 ease-out shrink-0 shadow-xl lg:shadow-none ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="flex flex-col">
           {/* CONTENEDOR DEL LOGO (MÁXIMO TAMAÑO) */}
            <div className="w-full pt-8 pb-4 px-2 flex flex-col items-center relative">
                {/* Se cambió max-w-[220px] a max-w-[250px] 
                  Se añadió scale-110 para agrandarlo visualmente
                  Se ajustó el margen inferior (pb-4) para equilibrarlo
                */}
                <img 
                    src={logoEmpresa} 
                    alt="Logo" 
                    className="w-full h-auto max-w-[250px] object-contain transform scale-110" 
                />
                <button 
                    onClick={() => setSidebarOpen(false)} 
                    className="lg:hidden absolute right-4 top-4 text-white/70 hover:text-white z-10"
                >
                    ✕
                </button>
            </div>

               {/* NAV COMPACTO (CORREGIDO: Eliminamos el overflow que rompía las curvas) */}
            <nav className="flex-1 pl-4 space-y-1 mt-2">
                {menuItems.map((item) => {
                    const activo = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider nav-button transition-transform duration-300 ${activo ? 'active-nav-curve text-[#0F766E] font-black' : 'text-teal-100/75 hover:text-white hover:translate-x-1.5'}`}
                        >
                            <span className={`transition-colors duration-200 ${activo ? 'text-[#0F766E]' : 'text-teal-200'}`}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            </div>

            {/* Botón de Log Out */}
            <div className="p-6">
                <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-teal-100/70 hover:text-white hover:bg-white/5 transition-all"
                >
                    <IconLogout />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>

        {/* Fondo protector oscuro difuminado para interacción móvil */}
        {sidebarOpen && (
            <div 
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-[#113130]/40 backdrop-blur-xs lg:hidden"
            ></div>
        )}

        {/* ================= CONTENEDOR CENTRAL (PANEL DE CONTENIDO) ================= */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#F4F8F8]">
            
            {/* Cabecera Superior (Header) - Mantiene su adaptabilidad móvil impecable */}
            <header className="px-6 lg:px-8 py-5 bg-transparent flex flex-col md:flex-row items-center justify-between gap-4 border-b border-teal-100/30">
                
                {/* Buscador */}
                <div className="relative w-full md:max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar paciente, informe, cita..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs bg-white text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all shadow-sm border border-teal-100/40"
                    />
                    <span className="absolute left-4 top-3.5 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </div>

                {/* Perfil del Usuario e Idiomas Responsivo */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-xs font-bold px-3 py-1.5 bg-white rounded-xl shadow-xs border border-teal-100/40 flex items-center gap-1.5 cursor-pointer hover:bg-teal-50/50 transition-colors">
                            <span>ESP</span>
                            <span className="text-[8px] text-teal-600">▼</span>
                        </div>
                        <button className="p-2.5 bg-white rounded-xl shadow-xs border border-teal-100/40 hover:bg-teal-50/50 transition-colors relative">
                            <svg className="w-4 h-4 text-[#113130]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#14B8A6] rounded-full"></span>
                        </button>
                        <button className="p-2.5 bg-white rounded-xl shadow-xs border border-teal-100/40 hover:bg-teal-50/50 transition-colors relative">
                            <svg className="w-4 h-4 text-[#113130]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.02 6.02 0 00-4.902-5.903m0 0V4a2 2 0 10-4 0v1.097A6.02 6.02 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0D9488] rounded-full animate-ping"></span>
                        </button>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-teal-200/50"></div>

                    <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-full shadow-xs border border-teal-100/40">
                        <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-black text-xs">
                            A
                        </div>
                        <div className="text-left overflow-hidden">
                            <h4 className="text-xs font-extrabold text-[#113130] truncate max-w-[120px] sm:max-w-none">@ALMASystem</h4>
                            <p className="text-[9px] text-[#0D9488] font-bold uppercase tracking-wider">Administrador</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Área de Contenido Dinámico */}
            <div className="flex-1 p-6 lg:p-8 animate-fade-in">
                {/* Aquí se renderizará el contenido según tus vistas dinámicas */}
            </div>
        </div>

        {/* ================= MODAL DE LOGOUT SEGURO ================= */}
        {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-[#113130]/50 backdrop-blur-xs transition-opacity duration-300"
                    onClick={() => setShowLogoutModal(false)}
                />
                <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-teal-100/30 text-center space-y-4 animate-fade-in">
                    <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-lg font-bold">
                        ⚠️
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-[#113130]">¿Cerrar sesión de forma segura?</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Confirmarás el término de la sesión clínica activa para la cuenta <span className="font-bold text-[#0D9488]">@ALMASystem@gmail.com</span>.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                setShowLogoutModal(false);
                                console.log("Sesión finalizada correctamente.");
                            }}
                            className="flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-500/20 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        )}

        </div>
    );
}